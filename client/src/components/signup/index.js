import React from "react";
import "./style.css";
import {GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {auth} from "../../firebase/firebase-config";

function Signup() {
    async function handleGoogleLogin() {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const username = user.displayName;
            const email = user.email;

            console.log("Google Login Success:", username, email);

            await fetch("http://localhost:8001/user/google-signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: username, email: email}),
            });

            alert("Google Signup/Login Successful!");
            window.location.href = "/account/main";
        } catch (error) {
            console.error("Google Login Error:", error.message);
            alert("Google login failed: " + error.message);
        }
    }

    async function handleSignup(event) {
        event.preventDefault();
        const username = document.querySelector("#signup-field-username").value;
        const email = document.querySelector("#signup-field-email").value;
        const password = document.querySelector("#signup-field-password").value;
        const confirmPassword = document.querySelector("#signup-field-confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8001/user/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, email, password}),
            });

            if (response.ok) {
                alert("Signup Successful! Redirecting...");
                window.location.href = "/account/login";
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Signup failed");
            }
        } catch (error) {
            console.error("Signup Error:", error.message);
            alert("Signup Error: " + error.message);
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-box">
                <form className="signup-form" onSubmit={handleSignup}>
                    <h2>Sign Up</h2>
                    <div className="inputBox">
                        <input type="text" required id="signup-field-username"/>
                        <span>Username</span>
                    </div>
                    <div className="inputBox">
                        <input type="email" required id="signup-field-email"/>
                        <span>Email</span>
                    </div>
                    <div className="inputBox">
                        <input type="password" required id="signup-field-password"/>
                        <span>Password</span>
                    </div>
                    <div className="inputBox">
                        <input type="password" required id="signup-field-confirm-password"/>
                        <span>Confirm Password</span>
                    </div>
                    <div className="links">
                        <p>Already have an account?</p>
                        <a href="/account/login" className="login">
                            Login
                        </a>
                    </div>
                    <div className="submit-button">
                        <button type="submit" className="submit-btn">Sign Up</button>
                    </div>
                    <p className="alternative-signin">Or sign up with</p>

                    <div className="social-icon">
                        <button type="button" onClick={handleGoogleLogin} className="google-btn">
    <span className="google-icon">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48"
        >
            <path
                fill="#4285F4"
                d="M24 9.5c3.15 0 5.8 1.08 7.93 3.19l5.9-5.9C34.45 3.18 29.63 1 24 1 14.8 1 7.14 7.15 4.4 15.3l7.48 5.8C13.3 15.6 18.14 9.5 24 9.5z"
            />
            <path
                fill="#34A853"
                d="M46.5 24.5c0-1.5-.13-2.95-.38-4.35H24v8.28h12.8c-.58 3.05-2.43 5.64-5.16 7.4l7.48 5.8c4.4-4.06 7.38-10.05 7.38-17.13z"
            />
            <path
                fill="#FBBC05"
                d="M11.88 28.9c-1.05-3.05-1.05-6.35 0-9.4l-7.48-5.8A22.93 22.93 0 0 0 1 24c0 3.85.95 7.5 2.6 10.7l7.48-5.8z"
            />
            <path
                fill="#EA4335"
                d="M24 47c6.2 0 11.4-2.05 15.2-5.5l-7.48-5.8c-2.05 1.38-4.68 2.2-7.72 2.2-5.86 0-10.7-4.1-12.12-9.6l-7.48 5.8C8.6 42.85 15.86 47 24 47z"
            />
        </svg>
    </span>
                            Sign Up with Google
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;