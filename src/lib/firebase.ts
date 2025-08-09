// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKu-bST8ybizSZBLGzsA2Wg_XGRa7FfUo",
  authDomain: "pitchiq-etlgu.firebaseapp.com",
  projectId: "pitchiq-etlgu",
  storageBucket: "pitchiq-etlgu.firebasestorage.app",
  messagingSenderId: "431808014647",
  appId: "1:431808014647:web:ac29d314fbf145df2652b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
