// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZQQrhPdH67S_Zq_OvcFza2dHHgFPODpo",
  authDomain: "erms-10f51.firebaseapp.com",
  projectId: "erms-10f51",
  storageBucket: "erms-10f51.firebasestorage.app",
  messagingSenderId: "912123250257",
  appId: "1:912123250257:web:e04d8cdb6e2f9fc43d9a70",
  measurementId: "G-YJ0TZ34BRX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = Platform.OS === "web" ? getAnalytics(app) : null;
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});