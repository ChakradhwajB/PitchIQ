// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "pitchiq-etlgu",
  "appId": "1:431808014647:web:ac29d314fbf145df2652b2",
  "storageBucket": "pitchiq-etlgu.firebasestorage.app",
  "apiKey": "AIzaSyDKu-bST8ybizSZBLGzsA2Wg_XGRa7FfUo",
  "authDomain": "pitchiq-etlgu.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "431808014647"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
