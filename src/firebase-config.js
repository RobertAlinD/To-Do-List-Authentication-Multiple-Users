// src/firebase-config.js

// Importarea bibliotecilor necesare de la Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Configurația Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChqYe3jyukADXNmB6j3ZVI3QImVulMLqM",
  authDomain: "to-do-app-backend-dc13e.firebaseapp.com",
  projectId: "to-do-app-backend-dc13e",
  storageBucket: "to-do-app-backend-dc13e.appspot.com",
  messagingSenderId: "609565103873",
  appId: "1:609565103873:web:26d0965e52ecd5a3dd2d00",
  measurementId: "G-9EV5KTFSKH"
};

// Inițializare aplicație Firebase
const app = initializeApp(firebaseConfig);

// Inițializare servicii Firebase
const db = getFirestore(app);
const auth = getAuth(app);

// Configurare provideri de autentificare
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Exportarea obiectelor necesare pentru utilizare în alte fișiere
export { db, auth, googleProvider, facebookProvider };
