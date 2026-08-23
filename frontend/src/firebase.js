import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Tomar notun Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBYKr2WufVkdIp4dctg-4U4PsfNOEU9z9U",
  authDomain: "healthcatch-ai-f458e.firebaseapp.com",
  projectId: "healthcatch-ai-f458e",
  storageBucket: "healthcatch-ai-f458e.firebasestorage.app",
  messagingSenderId: "491845077988",
  appId: "1:491845077988:web:1ccd2e00fa5a960cdd15f1",
  measurementId: "G-1QZFKR3ZZQ"
};

// Firebase chalu kora
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };