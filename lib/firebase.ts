import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDe72pDujum7ZW3DQjMqPg5MSn2vEkZf9g",
  authDomain: "cricket-track.firebaseapp.com",
  projectId: "cricket-track",
  storageBucket: "cricket-track.firebasestorage.app",
  messagingSenderId: "806120229097",
  appId: "1:806120229097:web:c8be5226b45f764ef3c878",
  measurementId: "G-6YMKBP7CQT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);