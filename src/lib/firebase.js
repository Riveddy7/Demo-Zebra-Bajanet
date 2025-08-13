// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHZH0LJQOkukE8iA4urVAJIr8jhpoEXK0",
  authDomain: "zebra-demo-71ec7.firebaseapp.com",
  projectId: "zebra-demo-71ec7",
  storageBucket: "zebra-demo-71ec7.firebasestorage.app",
  messagingSenderId: "322463519814",
  appId: "1:322463519814:web:db3f17187eb7a096016647",
  measurementId: "G-ZLRKK44HRB"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export default app;