import jwt from 'jsonwebtoken'
import { kv } from '@vercel/kv'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })

  let googleId
  try {
    googleId = jwt.verify(auth.split(' ')[1], JWT_SECRET).googleId
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const key = `user:${googleId}`
  let user = await kv.get(key)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (req.method === 'GET') {
    return res.json({ appetizers: user.appetizers || [], mains: user.mains || [] })
  }

  if (req.method === 'POST') {
    const { type, name, url } = req.body
    if (!type || !name) return res.status(400).json({ error: 'type and name required' })
    if (type !== 'appetizer' && type !== 'main') return res.status(400).json({ error: 'type must be appetizer or main' })
    const list = type === 'appetizer' ? user.appetizers : user.mains
    if (list.some(i => i.name === name)) return res.status(409).json({ error: 'Already exists' })
    list.push({ name, url: url || '' })
    await kv.set(key, JSON.stringify(user))
    return res.status(201).json({ appetizers: user.appetizers, mains: user.mains })
  }

  if (req.method === 'DELETE') {
    const { type } = req.query
    if (type !== 'appetizer' && type !== 'main') return res.status(400).json({ error: 'type query param required' })
    const list = type === 'appetizer' ? user.appetizers : user.mains
    const idx = list.findIndex(i => i.name === req.query.name)
    if (idx === -1) return res.status(404).json({ error: 'Item not found' })
    list.splice(idx, 1)
    await kv.set(key, JSON.stringify(user))
    return res.json({ appetizers: user.appetizers, mains: user.mains })
  }

  res.status(405).end()
}
