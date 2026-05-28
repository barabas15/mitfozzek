import 'dotenv/config'
import express from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const app = express()
app.use(express.json())

const store = new Map()

function json(str) { try { return JSON.parse(str) } catch { return null } }

app.post('/auth/firebase', (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'idToken required' })

  import('firebase-admin').then(async ({ default: admin }) => {
    if (!admin.apps.length) {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      if (key) admin.initializeApp({ credential: admin.credential.cert(json(key)) })
      else admin.initializeApp()
    }
    const decoded = await admin.auth().verifyIdToken(idToken)
    const { uid, name, picture, email } = decoded
    const key = `user:${uid}`
    let user = store.get(key)
    if (!user) {
      user = { googleId: uid, displayName: name || '', email: email || '', photo: picture || '', appetizers: [], mains: [] }
      store.set(key, JSON.stringify(user))
    }
    const { default: jwt } = await import('jsonwebtoken')
    const token = jwt.sign({ googleId: uid }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token })
  }).catch(err => res.status(500).json({ error: err.message }))
})

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.json({ user: null })
  try {
    import('jsonwebtoken').then(({ default: jwt }) => {
      const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET)
      const data = json(store.get(`user:${payload.googleId}`))
      res.json({ user: data || null })
    })
  } catch {
    res.json({ user: null })
  }
})

app.all('/api/items', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  let googleId
  try {
    import('jsonwebtoken').then(({ default: jwt }) => {
      googleId = jwt.verify(auth.split(' ')[1], JWT_SECRET).googleId
      const key = `user:${googleId}`
      let user = json(store.get(key))
      if (!user) return res.status(404).json({ error: 'User not found' })

      if (req.method === 'GET') return res.json({ appetizers: user.appetizers || [], mains: user.mains || [] })

      if (req.method === 'POST') {
        const { type, name, url } = req.body
        if (!type || !name) return res.status(400).json({ error: 'type and name required' })
        const list = type === 'appetizer' ? user.appetizers : user.mains
        if (list.some(i => i.name === name)) return res.status(409).json({ error: 'Already exists' })
        list.push({ name, url: url || '' })
        store.set(key, JSON.stringify(user))
        return res.status(201).json({ appetizers: user.appetizers, mains: user.mains })
      }

      if (req.method === 'DELETE') {
        const { type, name } = req.query
        if (type !== 'appetizer' && type !== 'main') return res.status(400).json({ error: 'type query param required' })
        const list = type === 'appetizer' ? user.appetizers : user.mains
        const idx = list.findIndex(i => i.name === name)
        if (idx === -1) return res.status(404).json({ error: 'Item not found' })
        list.splice(idx, 1)
        store.set(key, JSON.stringify(user))
        return res.json({ appetizers: user.appetizers, mains: user.mains })
      }

      res.status(405).end()
    })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`Dev API server on http://localhost:${PORT}`))
