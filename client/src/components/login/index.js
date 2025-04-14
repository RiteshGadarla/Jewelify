import React, { useState, useEffect } from "react";
import "./style.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Firebase Google Login
import { auth } from "../../firebase/firebase-config"; // Firebase Config Import

const loadRecaptcha = () => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
};

function Login() {
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecaptcha();
    }, []);

    // Google Login
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();

        try {
            // Sign in with Google popup
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Google Login Success:", user.displayName, user.email);

            // Send Google user data to backend
            const response = await fetch("http://localhost:8001/user/google-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.displayName, email: user.email }),
                credentials: "include", // Ensure cookies are sent for session management
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Google login failed");
            }

            const data = await response.json();
            console.log("Backend Response:", data);

            // Store username in sessionStorage for frontend usage
            sessionStorage.setItem("username", data.user.username);

            alert("Google Login Successful!");
            window.location.href = "./main/home"; // Redirect to home page
        } catch (error) {
            console.error("Google Login Error:", error.message);
            alert("Google login failed: " + error.message);
        }
    };


    // Normal Login
    const handleLogin = async (event) => {
        event.preventDefault();

        const username = document.querySelector("#login-field-username").value;
        const password = document.querySelector("#login-field-password").value;
        const captchaResponse = document.querySelector(".g-recaptcha-response").value;

        if (!captchaResponse) {
            alert("Please complete the reCAPTCHA.");
        } else {
            try {
                const captchaVerify = await fetch("http://localhost:8001/api/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ response: captchaResponse }),
                });

                const captchaData = await captchaVerify.json();
                if (captchaData.success) {
                    const response = await fetch("http://localhost:8001/user/login", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password }),
                    });

                    if (response.ok) {
                        sessionStorage.setItem("username", username);
                        window.location.href = "./main/home";
                    } else {
                        const errorResponse = await response.json();
                        throw new Error(errorResponse.error || "Login failed");
                    }
                }
            } catch (error) {
                alert("Invalid credentials");
                console.error("Login Error:", error.message);
                setError(error.message);
            }
        }
    };

    return (
        <>
            <div className="login-container">

                <div className="login-box">
                    <form onSubmit={handleLogin}>
                        <h2>Login</h2>
                        <div className="inputBox">
                            <input type="text" required id="login-field-username" autoComplete="off" />
                            <span>Username or E-mail</span>
                        </div>
                        <div className="inputBox">
                            <input type="password" required id="login-field-password" autoComplete="off" />
                            <span>Password</span>
                        </div>
                        <div className="g-recaptcha d-flex justify-content-center"
                            data-sitekey="6LcyqWsqAAAAAP0Ru9J_G_gEzYU0fXMIfiwdUHpE"></div>
                        <div className="links">
                            <p>Don't have an account?</p>
                            <a href="/account/signup" className="sign-up">
                                Sign Up
                            </a>
                        </div>

                        <div className="text-center">
                            <input type="submit" value="Login" />
                        </div>
                        <p className="alternative-signin">or you can sign in with</p>
                        <div className="social-icon">
                            {/* Google Login Button */}
                            <button type="button" onClick={handleGoogleLogin} className="google-btn">
                                <span className="google-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                                        <path fill="#4285F4"
                                            d="M24 9.5c3.15 0 5.8 1.08 7.93 3.19l5.9-5.9C34.45 3.18 29.63 1 24 1 14.8 1 7.14 7.15 4.4 15.3l7.48 5.8C13.3 15.6 18.14 9.5 24 9.5z" />
                                        <path fill="#34A853"
                                            d="M46.5 24.5c0-1.5-.13-2.95-.38-4.35H24v8.28h12.8c-.58 3.05-2.43 5.64-5.16 7.4l7.48 5.8c4.4-4.06 7.38-10.05 7.38-17.13z" />
                                        <path fill="#FBBC05"
                                            d="M11.88 28.9c-1.05-3.05-1.05-6.35 0-9.4l-7.48-5.8A22.93 22.93 0 0 0 1 24c0 3.85.95 7.5 2.6 10.7l7.48-5.8z" />
                                        <path fill="#EA4335"
                                            d="M24 47c6.2 0 11.4-2.05 15.2-5.5l-7.48-5.8c-2.05 1.38-4.68 2.2-7.72 2.2-5.86 0-10.7-4.1-12.12-9.6l-7.48 5.8C8.6 42.85 15.86 47 24 47z" />
                                    </svg>
                                </span>
                                Sign in with Google
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;