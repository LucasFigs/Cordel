// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DO FIREBASE
//
// Como preencher:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um projeto (ou use um existente)
// 3. Vá em "Configurações do Projeto" > "Seus apps" > adicione um app Web
// 4. Copie o objeto firebaseConfig e cole aqui abaixo
// 5. No console do Firebase, ative:
//    - Authentication > Sign-in method > E-mail/senha, Google, Facebook
//    - Firestore Database > Criar banco de dados
// ─────────────────────────────────────────────────────────────────────────────

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {

  apiKey: "AIzaSyCek_bkPBc2gl3cGrhMqzZroMQsmUkGQM",
  authDomain: "cordel-app.firebaseapp.com",
  projectId: "cordel-app",
  storageBucket: "cordel-app.firebasestorage.app",
  messagingSenderId: "116935046771",
  appId: "1:116935046771:web:20d7db5ef6ffbbbb871c06",
  measurementId: "G-ZTK1WRJN6D"

  /* DO SAMUCRUEL
  apiKey: "AIzaSyC_Att2D0og490eTXriZ5bAhV8WUFEpd5Y",
  authDomain: "snack-76d43.firebaseapp.com",
  projectId: "snack-76d43",
  storageBucket: "snack-76d43.firebasestorage.app",
  messagingSenderId: "462745149083",
  appId: "1:462745149083:web:aaa6f1edba250db0d5303e",
  measurementId: "G-L6MKG557H7",
  */
};

// Inicializa o Firebase apenas se não houver um app ativo
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta as variáveis exatamente como o código do seu colega espera
export const auth = firebase.auth();
export const db = firebase.firestore() as any;

export default firebase;
