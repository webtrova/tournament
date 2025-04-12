// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdY_iCkdup6lcmdl6v5ltPQEAGIhcBIiU",
  authDomain: "bdc-tournament.firebaseapp.com",
  projectId: "bdc-tournament",
  storageBucket: "bdc-tournament.firebasestorage.app",
  messagingSenderId: "244860054565",
  appId: "1:244860054565:web:955b83e62b26ea3afd63cc",
  measurementId: "G-KX4GT5SC5G"
};
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;
if (typeof window !== "undefined" && isSupported()) {
  analytics = getAnalytics(app);
}
export { auth, db, analytics };