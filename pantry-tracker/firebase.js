// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEgYDZl8G7QXPjD0QlbknBrDpUWYDP-V0",
  authDomain: "pantry-tracker-2e65e.firebaseapp.com",
  projectId: "pantry-tracker-2e65e",
  storageBucket: "pantry-tracker-2e65e.appspot.com",
  messagingSenderId: "932854987859",
  appId: "1:932854987859:web:bc1056140c8e0796cd9aa6",
  measurementId: "G-M071NLCKR3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {firestore, auth}
//put apikey in .env