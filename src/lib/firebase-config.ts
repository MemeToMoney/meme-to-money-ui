import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDp4JBVWpAUJPSZgay5Z93D4wD1ao5qb5s",
    authDomain: "memetomoney-977ca.firebaseapp.com",
    projectId: "memetomoney-977ca",
    storageBucket: "memetomoney-977ca.firebasestorage.app",
    messagingSenderId: "566317965965",
    appId: "1:566317965965:web:e13e5f99a97d93107db8c4",
    measurementId: "G-XBYLRSCT2C"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth };
