import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithCredential,
    signInWithPopup,       
    GoogleAuthProvider,
    GithubAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI Elements
const loginForm = document.getElementById("login-form");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleLoginBtn");
const githubBtn = document.getElementById("githubLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("auth-section");
const mainUI = document.getElementById("main-ui");

// ----- Email/Password Login -----
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            loginForm.email.value,
            loginForm.password.value
        );
        console.log("✅ Logged in:", userCredential.user);
    } catch (err) {
        console.error("❌ Login error:", err);
    }
});

// ----- Email/Password Signup -----
signupBtn.addEventListener("click", async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            loginForm.email.value,
            loginForm.password.value
        );
        console.log("✅ User created:", userCredential.user);
    } catch (err) {
        console.error("❌ Signup error:", err);
    }
});

// ----- Extension OAuth Helper -----
async function extensionOAuth(providerName, clientId, authUrl, scope) {
    return new Promise((resolve, reject) => {
        if (!chrome?.runtime?.sendMessage) return reject(new Error("Not in extension context"));

        chrome.runtime.sendMessage(
            { type: "oauth", provider: providerName, clientId, authUrl, scope },
            (response) => {
                if (response.error) reject(new Error(response.error));
                else resolve(response.token);
            }
        );
    });
}

// ----- Google Login -----
googleBtn.addEventListener("click", async () => {
    try {
        let token;
        if (chrome?.identity) {
            token = await extensionOAuth(
                "google",
                "423292605879-18essmfcuhdgtvl7vomedutnfslt65ro.apps.googleusercontent.com",
                "https://accounts.google.com/o/oauth2/v2/auth",
                "email profile"
            );
        } else {
            // Fallback for web: use Firebase popup
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            console.log("✅ Google logged in (web):", userCredential.user);
            return;
        }

        const credential = GoogleAuthProvider.credential(null, token);
        const userCredential = await signInWithCredential(auth, credential);
        console.log("✅ Google logged in (extension):", userCredential.user);
    } catch (err) {
        console.error("❌ Google login error:", err);
    }
});

// ----- GitHub Login -----
githubBtn.addEventListener("click", async () => {
    try {
        let token;
        if (chrome?.identity) {
            token = await extensionOAuth(
                "github",
                "Ov23liqJTCLcvXNW9sRH",
                "https://github.com/login/oauth/authorize",
                "read:user user:email"
            );
        } else {
            const provider = new GithubAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            console.log("✅ GitHub logged in (web):", userCredential.user);
            return;
        }

        const credential = GithubAuthProvider.credential(token);
        const userCredential = await signInWithCredential(auth, credential);
        console.log("✅ GitHub logged in (extension):", userCredential.user);
    } catch (err) {
        console.error("❌ GitHub login error:", err);
    }
});

// ----- Logout -----
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("✅ User logged out");
    } catch (err) {
        console.error("❌ Logout error:", err);
    }
});

// ----- Auth State Listener -----
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.style.display = "none";
        mainUI.style.display = "block";
        logoutBtn.style.display = "inline-block";
        console.log("👤 User signed in:", user);
    } else {
        authSection.style.display = "flex";
        mainUI.style.display = "none";
        logoutBtn.style.display = "none";
        console.log("👤 No user signed in");
    }
});
