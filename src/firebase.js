import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, inMemoryPersistence, browserLocalPersistence } from "firebase/auth";
import { Capacitor } from "@capacitor/core"; 

// ⚠️ HARDCODED KEYS (Required for Simulator)
const firebaseConfig = {
  apiKey: "AIzaSyDLkWCFKFTx_B8O_lUBkvrqbj4osSH6bAI",
  authDomain: "fairway-commissioner.firebaseapp.com",
  projectId: "fairway-commissioner",
  storageBucket: "fairway-commissioner.firebasestorage.app",
  messagingSenderId: "750462707834",
  appId: "1:750462707834:web:6befd708a4fbf6e99733c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let auth;

// ⚡️ THE REAL FIX: 
// initializeAuth + Memory Persistence + Hardcoded Keys
if (Capacitor.getPlatform() === 'ios') {
    auth = initializeAuth(app, {
        persistence: inMemoryPersistence
    });
    console.log("📱 iOS: Auth started directly in Memory Mode with Valid Keys");
} else {
    // Android/Web
    auth = getAuth(app);
    auth.setPersistence(browserLocalPersistence);
}

// Initialize Database
const db = getFirestore(app);

export { auth, db };