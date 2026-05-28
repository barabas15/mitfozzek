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

  const verifyIdToken = async (token) => {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (key && key.length > 10) {
      const { default: admin } = await import('firebase-admin')
      if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(json(key)) })
      return admin.auth().verifyIdToken(token)
    }
    const { default: jwt } = await import('jsonwebtoken')
    return jwt.decode(token)
  }

  verifyIdToken(idToken).then(async (decoded) => {
    if (!decoded) throw new Error('Invalid token')
    const uid = decoded.sub || decoded.uid
    const name = decoded.name || ''
    const picture = decoded.picture || ''
    const email = decoded.email || ''
    let user = json(store.get(`user:${uid}`))
    let isNew = false
    if (!user) {
      isNew = true
      user = { googleId: uid, displayName: name, email, photo: picture, appetizers: [], mains: [], desserts: [] }
      store.set(`user:${uid}`, JSON.stringify(user))
    }
    const { default: jwt } = await import('jsonwebtoken')
    const token = jwt.sign({ googleId: uid }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, isNew })
  }).catch(err => res.status(500).json({ error: err.message }))
})

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.json({ user: null })
  import('jsonwebtoken').then(({ default: jwt }) => {
    try {
      const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET)
      const data = json(store.get(`user:${payload.googleId}`))
      res.json({ user: data || null })
    } catch { res.json({ user: null }) }
  }).catch(() => res.json({ user: null }))
})

app.all('/api/items', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  import('jsonwebtoken').then(({ default: jwt }) => {
    let googleId
    try { googleId = jwt.verify(auth.split(' ')[1], JWT_SECRET).googleId }
    catch { return res.status(401).json({ error: 'Invalid token' }) }
    const key = `user:${googleId}`
    let user = json(store.get(key))
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (req.method === 'GET') return res.json({ appetizers: user.appetizers || [], mains: user.mains || [], desserts: user.desserts || [] })

    if (req.method === 'POST') {
      const { type, name, url } = req.body
      if (!type || !name) return res.status(400).json({ error: 'type and name required' })
      if (!['appetizer', 'main', 'dessert'].includes(type)) return res.status(400).json({ error: 'invalid type' })
      const field = type === 'appetizer' ? 'appetizers' : type === 'main' ? 'mains' : 'desserts'
      if (!user[field]) user[field] = []
      user[field].push({ name, url: url || '' })
      store.set(key, JSON.stringify(user))
      return res.status(201).json({ appetizers: user.appetizers || [], mains: user.mains || [], desserts: user.desserts || [] })
    }

    if (req.method === 'DELETE') {
      const { type, name } = req.query
      if (!['appetizer', 'main', 'dessert'].includes(type)) return res.status(400).json({ error: 'invalid type' })
      const field = type === 'appetizer' ? 'appetizers' : type === 'main' ? 'mains' : 'desserts'
      if (!user[field]) return res.status(404).json({ error: 'Item not found' })
      const idx = user[field].findIndex(i => i.name === name)
      if (idx === -1) return res.status(404).json({ error: 'Item not found' })
      user[field].splice(idx, 1)
      store.set(key, JSON.stringify(user))
      return res.json({ appetizers: user.appetizers || [], mains: user.mains || [], desserts: user.desserts || [] })
    }

    res.status(405).end()
  }).catch(() => res.status(500).json({ error: 'Internal error' }))
})

const PORT = 3001
app.listen(PORT, () => console.log(`Dev API server on http://localhost:${PORT}`))
