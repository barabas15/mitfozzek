import jwt from 'jsonwebtoken'
import { admin, db } from './firebase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const USERS = db.collection('users')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'idToken required' })

  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    const { uid, name, picture, email } = decoded

    const doc = await USERS.doc(uid).get()
    if (!doc.exists) {
      await USERS.doc(uid).set({
        googleId: uid,
        displayName: name || '',
        email: email || '',
        photo: picture || '',
        appetizers: [],
        mains: [],
        desserts: [],
      })
    }

    const token = jwt.sign({ googleId: uid }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token })
  } catch {
    res.status(401).json({ error: 'Invalid Firebase token' })
  }
}
