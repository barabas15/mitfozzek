import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyByRFbMIqTYGRKoUD-6YiwkqGQtJtZwYWI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mit-fozzek.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mit-fozzek",
  storageBucket: "mit-fozzek.firebasestorage.app",
  messagingSenderId: "601606292041",
  appId: "1:601606292041:web:cb44986641e681f1a7b598",
  measurementId: "G-SV3PDCSX82",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider, signInWithRedirect, getRedirectResult }
