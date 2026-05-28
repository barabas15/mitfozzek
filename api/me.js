import jwt from 'jsonwebtoken'
import { db } from './firebase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.json({ user: null })

  try {
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET)
    const doc = await db.collection('users').doc(payload.googleId).get()
    res.json({ user: doc.exists ? doc.data() : null })
  } catch {
    res.json({ user: null })
  }
}
