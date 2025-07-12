import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAFoyi_t8ZexvM6VtKd-XRozE6Fp_dipY4",
  authDomain: "https://accounts.google.com/o/oauth2/auth",
  projectId: "peaknet-8910d",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "peaknet2025@gmail.com",
  appId: "peaknet-8910d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);