// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ----- Firebase Config -----
const firebaseConfig = {
    apiKey: "AIzaSyALsOaImgmDMpcBBaHSpXxKUYjcPHMF8EA",
    authDomain: "chrome-extension-d1664.firebaseapp.com",
    projectId: "chrome-extension-d1664",
    storageBucket: "chrome-extension-d1664.firebasestorage.app",
    messagingSenderId: "423292605879",
    appId: "1:423292605879:web:bdcc3f6d490130399d8432",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase initialized:", app.name);

// Initialize Auth
const auth = getAuth(app);
console.log("✅ Auth object created:", auth);

// ----- Auth Providers -----
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ----- UI Elements -----
const loginForm = document.getElementById("login-form");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleLoginBtn");
const githubBtn = document.getElementById("githubLoginBtn");
const authSection = document.getElementById("auth-section");
const mainUI = document.getElementById("main-ui");

// ----- Email/Password Login -----
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ Logged in:", userCredential.user);
        })
        .catch((err) => console.error("❌ Login error:", err));
});

// ----- Email/Password Signup -----
signupBtn.addEventListener("click", () => {
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ User created:", userCredential.user);
        })
        .catch((err) => console.error("❌ Signup error:", err));
});

// ----- Google Login -----
googleBtn.addEventListener("click", () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => console.log("✅ Google logged in:", result.user))
        .catch((err) => console.error("❌ Google login error:", err));
});

// ----- GitHub Login -----
githubBtn.addEventListener("click", () => {
    signInWithPopup(auth, githubProvider)
        .then((result) => console.log("✅ GitHub logged in:", result.user))
        .catch((err) => console.error("❌ GitHub login error:", err));
});

// ----- Auth State Listener -----
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.style.display = "none";
        mainUI.style.display = "block";
        console.log("👤 User signed in:", user);
    } else {
        authSection.style.display = "block";
        mainUI.style.display = "none";
        console.log("👤 No user signed in");
    }
});
