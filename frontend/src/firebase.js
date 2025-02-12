import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMnhxZxeX_4gVUHpsXMVmqX_FnNNMM-zE",
  authDomain: "cswd-b0130.firebaseapp.com",
  projectId: "cswd-b0130",
  storageBucket: "cswd-b0130.firebasestorage.app",
  messagingSenderId: "677891423160",
  appId: "1:677891423160:web:12714b4c38fa1f439cad4d",
  measurementId: "G-EVWGXRC7FG"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };  