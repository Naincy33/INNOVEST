import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBb7p5t4Z8aMJ9TEBi8IKUKB7eTRj4llT4",
  authDomain: "innovest-71271.firebaseapp.com",
  projectId: "innovest-71271",
  storageBucket: "innovest-71271.firebasestorage.app",
  messagingSenderId: "622504218911",
  appId: "1:622504218911:web:d00f6e1bff6338864de02a",
};

// 🔥 MUST
const app = initializeApp(firebaseConfig);

// 🔥 export
export const auth = getAuth(app);
export const db = getFirestore(app);