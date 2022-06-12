// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQT35NNNgpXKuCVL21GrzD7wdo0zTlKaE",
  authDomain: "sandbox-3ba07.firebaseapp.com",
  projectId: "sandbox-3ba07",
  storageBucket: "sandbox-3ba07.appspot.com",
  messagingSenderId: "123276506770",
  appId: "1:123276506770:web:3f027c49a3295a1738584b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth()
const storage = getStorage();

export { db, auth, storage }