import jwt from 'jsonwebtoken'
import { kv } from '@vercel/kv'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.json({ user: null })

  try {
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET)
    const data = await kv.get(`user:${payload.googleId}`)
    res.json({ user: data || null })
  } catch {
    res.json({ user: null })
  }
}
