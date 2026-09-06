import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.apiKey_2 || process.env.apiKey || 'development-fallback-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'evolve-luxe.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'evolve-luxe',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'evolve-luxe.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '850790889441',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:850790889441:web:145f7df494149f38d884a0',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-Y439BT9BC4',
}

const fallbackConfig = {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey || 'development-fallback-key',
}

function getFirebaseApp(): FirebaseApp {
  try {
    return getApps()[0] ?? initializeApp(firebaseConfig)
  } catch (error) {
    console.warn('[v0] Firebase initialization failed; using fallback app', error)
    try {
      return getApps().find((candidate) => candidate.name === 'fallback-runtime-app') ?? initializeApp(fallbackConfig, 'fallback-runtime-app')
    } catch (fallbackError) {
      console.warn('[v0] Firebase fallback initialization failed', fallbackError)
      return initializeApp({ ...fallbackConfig, apiKey: 'fallback-runtime-key' }, 'last-resort-runtime-app')
    }
  }
}

const app = getFirebaseApp()

export const auth = (() => {
  try {
    return getAuth(app)
  } catch (error) {
    console.warn('[v0] Firebase Auth unavailable', error)
    return null
  }
})() as Auth

export const db = (() => {
  try {
    return getFirestore(app)
  } catch (error) {
    console.warn('[v0] Firestore unavailable', error)
    return null
  }
})() as Firestore

export { app }
