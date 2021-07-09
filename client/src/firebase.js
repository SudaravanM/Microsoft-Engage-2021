import firebase from "firebase/app";
import "firebase/auth";

export const auth = firebase
  .initializeApp({
    apiKey: "AIzaSyDxpM4Q9epAJ1k3TlMUXzB-eFzYhZqz2U8",
    authDomain: "teamsclone-42147.firebaseapp.com",
    projectId: "teamsclone-42147",
    storageBucket: "teamsclone-42147.appspot.com",
    messagingSenderId: "715269784450",
    appId: "1:715269784450:web:d4a9abd1e6e10271bbc59b",
  })
  .auth();
