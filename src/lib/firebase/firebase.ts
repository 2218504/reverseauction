
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "reverseauctionpro",
  "appId": "1:229980150935:web:6d4fb0683e287d4f745dd2",
  "storageBucket": "reverseauctionpro.firebasestorage.app",
  "apiKey": "AIzaSyAa1LCUNkJ9tJqC-EDlXGhI7ZuP_ZgBki0",
  "authDomain": "reverseauctionpro.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "229980150935"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
