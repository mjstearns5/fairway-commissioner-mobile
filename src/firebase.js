// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// PASTE YOUR CONFIG FROM STEP 2 BELOW
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

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database variable so we can use it elsewhere
export { db };