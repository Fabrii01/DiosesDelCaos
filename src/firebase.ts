
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBz_0i7tTWgoHdekpRBNRpfqo1fQQ-G7o",
  authDomain: "guildtreasurytbc.firebaseapp.com",
  projectId: "guildtreasurytbc",
  storageBucket: "guildtreasurytbc.firebasestorage.app",
  messagingSenderId: "850952744092",
  appId: "1:850952744092:web:bcaa02e4418e80c2ec9159",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
