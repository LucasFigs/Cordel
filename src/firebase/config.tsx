import firebase from 'firebase';
import 'firebase/firestore';


const firebaseConfig = {
  
}



if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
 
const auth = firebase.auth();
const db   = firebase.firestore();
 
export { auth, db };