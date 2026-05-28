import jwt from 'jsonwebtoken'
import { db } from './firebase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const USERS = db.collection('users')

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })

  let googleId
  try {
    googleId = jwt.verify(auth.split(' ')[1], JWT_SECRET).googleId
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const ref = USERS.doc(googleId)
  const doc = await ref.get()
  if (!doc.exists) return res.status(404).json({ error: 'User not found' })
  const user = doc.data()

  if (req.method === 'GET') {
    return res.json({ appetizers: user.appetizers || [], mains: user.mains || [], desserts: user.desserts || [] })
  }

  if (req.method === 'POST') {
    const { type, name, url } = req.body
    if (!type || !name) return res.status(400).json({ error: 'type and name required' })
    if (!['appetizer', 'main', 'dessert'].includes(type)) return res.status(400).json({ error: 'type must be appetizer, main or dessert' })
    const field = type === 'appetizer' ? 'appetizers' : type === 'main' ? 'mains' : 'desserts'
    const list = user[field] || []
    if (list.some(i => i.name === name)) return res.status(409).json({ error: 'Already exists' })
    list.push({ name, url: url || '' })
    await ref.update({ [field]: list })
    return res.status(201).json({ appetizers: user.appetizers || [], mains: user.mains || [], desserts: user.desserts || [] })
  }

  if (req.method === 'DELETE') {
    const { type, name } = req.query
    if (!['appetizer', 'main', 'dessert'].includes(type)) return res.status(400).json({ error: 'type query param required' })
    const field = type === 'appetizer' ? 'appetizers' : type === 'main' ? 'mains' : 'desserts'
    const list = user[field] || []
    const idx = list.findIndex(i => i.name === name)
    if (idx === -1) return res.status(404).json({ error: 'Item not found' })
    list.splice(idx, 1)
    await ref.update({ [field]: list })
    return res.json({ appetizers: user.appetizers || [], mains: user.mains || [], desserts: user.desserts || [] })
  }

  res.status(405).end()
}
