import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'
import { kv } from '@vercel/kv'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (key) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(key)) })
  } else {
    admin.initializeApp()
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'idToken required' })

  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    const { uid, name, picture, email } = decoded

    const key = `user:${uid}`
    let user = await kv.get(key)
    if (!user) {
      user = { googleId: uid, displayName: name || '', email: email || '', photo: picture || '', appetizers: [], mains: [] }
      await kv.set(key, JSON.stringify(user))
    }

    const token = jwt.sign({ googleId: uid }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token })
  } catch (err) {
    res.status(401).json({ error: 'Invalid Firebase token' })
  }
}
