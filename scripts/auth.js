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
    signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ✅ Import config
import { firebaseConfig } from './config.js';

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
const signupForm = document.getElementById("signup-form");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleLoginBtn");
const githubBtn = document.getElementById("githubLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("auth-section");
const mainUI = document.getElementById("main-ui");
const authError = document.getElementById("auth-error");

// ----- Email/Password Login -----
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    authError.textContent = "";
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ Logged in:", userCredential.user);
        })
        .catch((err) => {
            console.error("❌ Login error:", err);
            authError.style.color = "red";
            authError.textContent = err.message;
        });
});

// ----- Email/Password Signup -----
signupBtn.addEventListener("click", () => {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    authError.textContent = "";
    if (!email || !password) {
        authError.style.color = "red";
        authError.textContent = "Please enter both email and password.";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ User created:", userCredential.user);
            authError.style.color = "green";
            authError.textContent = "Account created successfully!";
        })
        .catch((err) => {
            console.error("❌ Signup error:", err);
            authError.style.color = "red";
            if (err.code === "auth/email-already-in-use") {
                authError.textContent = "Email already in use. Try logging in.";
            } else if (err.code === "auth/invalid-email") {
                authError.textContent = "Invalid email format.";
            } else if (err.code === "auth/weak-password") {
                authError.textContent = "Password should be at least 6 characters.";
            } else {
                authError.textContent = err.message;
            }
        });
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

// ----- Logout -----
logoutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => console.log("✅ User logged out"))
        .catch((err) => console.error("❌ Logout error:", err));
});

// ----- Auth State Listener -----
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.style.display = "none";
        mainUI.style.display = "block";
        logoutBtn.style.display = "inline-block";
        console.log("👤 User signed in:", user);
    } else {
        authSection.style.display = "block";
        mainUI.style.display = "none";
        logoutBtn.style.display = "none";
        console.log("👤 No user signed in");
    }
});
