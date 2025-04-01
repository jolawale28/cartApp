import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// My web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWI4t6SPkWm6iss0RubCo8hE3ao9UlA8M",
    authDomain: "mycartapp-5fa93.firebaseapp.com",
    projectId: "mycartapp-5fa93",
    storageBucket: "mycartapp-5fa93.firebasestorage.app",
    messagingSenderId: "936992686294",
    appId: "1:936992686294:web:d126e2d5381af6f37a4977"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db };