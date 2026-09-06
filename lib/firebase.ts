import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.apiKey_2,
  authDomain: 'evolve-luxe.firebaseapp.com',
  projectId: 'evolve-luxe',
  storageBucket: 'evolve-luxe.firebasestorage.app',
  messagingSenderId: '850790889441',
  appId: '1:850790889441:web:145f7df494149f38d884a0',
  measurementId: 'G-Y439BT9BC4',
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export { app }
