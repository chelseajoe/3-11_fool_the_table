// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB05TZLCz1PYronOj_P9EGKAiPTSN4wbRw",
  authDomain: "fool-the-table.firebaseapp.com",
  databaseURL: "https://fool-the-table-default-rtdb.firebaseio.com",
  projectId: "fool-the-table",
  storageBucket: "fool-the-table.firebasestorage.app",
  messagingSenderId: "1084663483086",
  appId: "1:1084663483086:web:42f16a36d81180b9789e9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);