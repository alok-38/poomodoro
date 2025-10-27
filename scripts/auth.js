import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithCredential,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    fetchSignInMethodsForEmail,
    linkWithCredential,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI elements
const loginForm = document.getElementById("login-form");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleLoginBtn");
const githubBtn = document.getElementById("githubLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("auth-section");
const mainUI = document.getElementById("main-ui");
const authError = document.getElementById("auth-error");

// Feedback helpers
function showError(msg) {
    if (authError) {
        authError.textContent = msg;
        authError.style.display = "block";
    }
}
function clearError() {
    if (authError) {
        authError.textContent = "";
        authError.style.display = "none";
    }
}

// ---------- Email/Password ----------
loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    clearError();
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            loginForm.email.value,
            loginForm.password.value
        );
        console.log("✅ Logged in:", userCredential.user);
    } catch (err) {
        console.error("❌ Login error:", err);
        switch (err.code) {
            case "auth/user-not-found":
                showError("No account found for this email. Please sign up.");
                break;
            case "auth/wrong-password":
                showError("Incorrect password. Try again.");
                break;
            case "auth/invalid-email":
                showError("Invalid email address.");
                break;
            default:
                showError("Login failed. Check your credentials.");
        }
    }
});

signupBtn?.addEventListener("click", async () => {
    clearError();
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            loginForm.email.value,
            loginForm.password.value
        );
        console.log("✅ User created:", userCredential.user);
    } catch (err) {
        console.error("❌ Signup error:", err);
        switch (err.code) {
            case "auth/email-already-in-use":
                showError("Email already in use.");
                break;
            case "auth/invalid-email":
                showError("Invalid email.");
                break;
            case "auth/weak-password":
                showError("Password must be at least 6 characters.");
                break;
            default:
                showError("Signup failed. Try again.");
        }
    }
});

// ---------- Chrome Extension OAuth ----------
async function extensionOAuth(providerName, clientId, authUrl, scope) {
    return new Promise((resolve, reject) => {
        if (!chrome?.identity?.launchWebAuthFlow) return reject(new Error("Not in extension"));

        const redirectUri = chrome.identity.getRedirectURL(providerName);
        const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;

        chrome.identity.launchWebAuthFlow({ url, interactive: true }, redirectedTo => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));

            const params = new URLSearchParams(new URL(redirectedTo).hash.substring(1));
            const token = params.get("access_token");
            if (token) resolve(token);
            else reject(new Error("No access token found"));
        });
    });
}

// ---------- Google Login ----------
googleBtn?.addEventListener("click", async () => {
    clearError();
    try {
        let userCredential;

        if (chrome?.identity) {
            const token = await extensionOAuth(
                "google",
                "423292605879-18essmfcuhdgtvl7vomedutnfslt65ro.apps.googleusercontent.com",
                "https://accounts.google.com/o/oauth2/v2/auth",
                "email profile"
            );
            const credential = GoogleAuthProvider.credential(null, token);
            userCredential = await signInWithCredential(auth, credential);
        } else {
            const provider = new GoogleAuthProvider();
            userCredential = await signInWithPopup(auth, provider);
        }

        console.log("✅ Google logged in:", userCredential.user);
    } catch (err) {
        console.error("❌ Google login error:", err);
        showError("Google login failed. Try again.");
    }
});

// ---------- GitHub Login ----------
githubBtn?.addEventListener("click", async () => {
    clearError();
    try {
        let userCredential;

        if (chrome?.identity) {
            const token = await extensionOAuth(
                "github",
                "Ov23liqJTCLcvXNW9sRH",
                "https://github.com/login/oauth/authorize",
                "read:user user:email"
            );
            const credential = GithubAuthProvider.credential(token);
            userCredential = await signInWithCredential(auth, credential);
        } else {
            const provider = new GithubAuthProvider();
            userCredential = await signInWithPopup(auth, provider);
        }

        console.log("✅ GitHub logged in:", userCredential.user);
    } catch (err) {
        if (err.code === "auth/account-exists-with-different-credential") {
            const email = err.customData?.email;
            const pendingCred = GithubAuthProvider.credentialFromError(err);
            showError(`Email ${email} already exists. Log in with existing provider first.`);

            onAuthStateChanged(auth, async user => {
                if (user && pendingCred) {
                    try {
                        await linkWithCredential(user, pendingCred);
                        console.log("✅ Linked GitHub credential to existing account");
                    } catch (linkErr) {
                        console.error("❌ Failed to link GitHub:", linkErr);
                        showError("Failed to link GitHub account.");
                    }
                }
            });
        } else {
            console.error("❌ GitHub login error:", err);
            showError("GitHub login failed. Try again.");
        }
    }
});

// ---------- Logout ----------
logoutBtn?.addEventListener("click", async () => {
    clearError();
    try {
        await signOut(auth);
        console.log("✅ User logged out");
    } catch (err) {
        console.error("❌ Logout error:", err);
        showError("Logout failed. Try again.");
    }
});

// ---------- Auth State Listener ----------
onAuthStateChanged(auth, user => {
    clearError();
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
