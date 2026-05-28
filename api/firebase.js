import admin from 'firebase-admin'

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (key) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(key)) })
  } else {
    admin.initializeApp()
  }
}

const db = admin.firestore()

export { admin, db }
