import React, {useState, useEffect} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import "./HomeSB.css";

export default function HomeSB() {
    const [username, setUsername] = useState("Guest");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch("http://localhost:8001/user/details", {
                    method: "GET",
                    credentials: "include", // To include cookies/session data
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user details");
                }

                const data = await response.json();
                setUsername(data.username || "Guest"); // Set fetched username or fallback to Guest
                sessionStorage.setItem("username", data.username || "Guest");
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };

        fetchUsername();
    }, []);

    return (
        <div className="homeSB-container">
            <div className="homeSB-content">
                <h1 className="homeSB-title">Welcome, {username}!</h1>
                <section className="homeSB-about">
                    <h2 className="homeSB-subtitle">About Our Project</h2>
                    <p className="homeSB-paragraph">
                        We specialize in transforming <strong>jewelry sketches</strong> into
                        <strong> realistic gold images</strong>. Our platform uses cutting-edge AI technology to
                        convert artistic sketches into lifelike visuals, empowering designers and enthusiasts.
                    </p>
                </section>
                <section className="homeSB-features">
                    <h2 className="homeSB-subtitle">Key Features</h2>
                    <ul className="homeSB-list">
                        <li className="homeSB-list-item">
                            ✍️ <strong>Sketch to Real:</strong> Upload your jewelry sketches and convert them into
                            stunning gold visuals.
                        </li>
                        <li className="homeSB-list-item">
                            📝 <strong>Text-to-Image:</strong> Describe your jewelry design in text and generate its
                            image.
                        </li>
                        <li className="homeSB-list-item">
                            🎨 <strong>High-Quality Output:</strong> Generate high-resolution, realistic visuals of
                            jewelry.
                        </li>
                        <li className="homeSB-list-item">
                            🚀 <strong>Fast & Accurate:</strong> Get results quickly with precision-driven AI models.
                        </li>
                    </ul>
                </section>
                <section className="homeSB-call-to-action">
                    <p className="homeSB-paragraph">Start transforming your jewelry sketches into reality today!</p>
                    <button
                        className="homeSB-button"
                        onClick={() => navigate("/account/main/image-to-image")}
                    >
                        Try Sketch-to-Real
                    </button>
                    <button
                        className="homeSB-button homeSB-button-outline"
                        onClick={() => navigate("/account/main/text-to-image")}
                    >
                        Explore Text-to-Image
                    </button>
                </section>
                <Outlet/>
            </div>
        </div>
    );
}
