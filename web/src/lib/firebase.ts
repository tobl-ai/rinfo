import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "rinfo-library-stats",
  appId: "1:731780010701:web:0eb1dd374340d46bfd4f84",
  storageBucket: "rinfo-library-stats.firebasestorage.app",
  apiKey: "AIzaSyA2XSvwmocTjaGpa9FklGS7VFkhRAR_pR8",
  authDomain: "rinfo-library-stats.firebaseapp.com",
  messagingSenderId: "731780010701",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
