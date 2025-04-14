import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyA3M0cX6DDobXDcJbNNzpTF_UHgP2D9iq0",
    authDomain: "projectj-d79b0.firebaseapp.com",
    projectId: "projectj-d79b0",
    storageBucket: "projectj-d79b0.appspot.com", // Fixed typo here
    messagingSenderId: "182583550810",
    appId: "1:182583550810:web:03756c75dfef04ac240963",
    measurementId: "G-YM67QRKG3S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
