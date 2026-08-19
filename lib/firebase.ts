import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIMPN29TddcMMH5k2THoho4UE8xMfdL3o",
  authDomain: "easysafar-1c895.firebaseapp.com",
  projectId: "easysafar-1c895",
  storageBucket: "easysafar-1c895.firebasestorage.app",
  messagingSenderId: "1067111688378",
  appId: "1:1067111688378:web:ea05cee75f18a6e180fa83",
  measurementId: "G-P78PJ2W0E8"
};

// This safely initializes Firebase without crashing Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the Auth and Database tools so we can use them in other files
export const auth = getAuth(app);
export const db = getFirestore(app);