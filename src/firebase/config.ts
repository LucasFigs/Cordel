
import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_Att2D0og490eTXriZ5bAhV8WUFEPd5Y",
  authDomain: "snack-76d43.firebaseapp.com",
  projectId: "snack-76d43",
  storageBucket: "snack-76d43.firebasestorage.app",
  messagingSenderId: "462745149083",
  appId: "1:462745149083:web:aaa6f1edba250db0d5303e",
  measurementId: "G-L6MKG557H7"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
 
const auth = firebase.auth();
const db   = firebase.firestore();
 
export { auth, db };