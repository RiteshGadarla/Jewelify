import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiGrid, FiHeart, FiArrowRight } from "react-icons/fi";
import "./HomeSB.css";
import FeaturedImg from "./featured-designs.png";

export default function HomeSB() {
    const [username, setUsername] = useState("Designer");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/details`, {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username || "Designer");
                    sessionStorage.setItem("username", data.username || "Designer");
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };
        fetchUsername();
    }, []);

    const quickActions = [
        { title: "Sketch to Real", desc: "Convert hand-drawn ideas", icon: <FiPlus />, link: "/account/main/image-to-image", color: "var(--primary)" },
        { title: "Text to Image", desc: "Convert ideas", icon: <FiPlus />, link: "/account/main/text-to-image", color: "#64748b" },
        { title: "My Collections", desc: "View your saved designs", icon: <FiGrid />, link: "/account/main/collections", color: "#8b5cf6" },
        { title: "Favorites", desc: "Your top picked gems", icon: <FiHeart />, link: "/account/main/favourites", color: "#ec4899" },
    ];

    return (
        <div className="homeSB-wrapper fade-in">
            <header className="dashboard-header">
                <div>
                    <h1>Welcome back, <span className="text-gradient">{username}</span></h1>
                    <p className="subtitle">Ready to create something extraordinary today?</p>
                </div>
                <button className="btn-premium btn-premium-primary" onClick={() => navigate("/account/main/image-to-image")}>
                    New Design <FiPlus />
                </button>
            </header>

            <div className="dashboard-grid">
                <section className="highlights-section card-glass">
                    <div className="section-header">
                        <h3>Featured Inspiration</h3>
                        <p>Latest trends in AI-generated jewelry</p>
                    </div>
                    <div className="inspiration-card">
                        <img src={FeaturedImg} alt="Featured Designs" />
                        <div className="inspiration-overlay">
                            <h4>Organic Forms Collection</h4>
                            <p>Explore the fusion of nature and computation.</p>
                            <button className="btn-text">View Gallery <FiArrowRight /></button>
                        </div>
                    </div>
                </section>

                <section className="actions-section">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        {quickActions.map((action, i) => (
                            <div key={i} className="action-card glass-hover" onClick={() => navigate(action.link)}>
                                <div className="action-icon" style={{ backgroundColor: action.color }}>
                                    {action.icon}
                                </div>
                                <div className="action-info">
                                    <h4>{action.title}</h4>
                                    <p>{action.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="stats-grid">
                <div className="stat-card glass">
                    <h4>Active Designs</h4>
                    <p className="stat-val">12</p>
                    <span className="stat-trend up">+2 this week</span>
                </div>
                <div className="stat-card glass">
                    <h4>Total Favorites</h4>
                    <p className="stat-val">48</p>
                    <span className="stat-trend">Stable</span>
                </div>
                <div className="stat-card glass">
                    <h4>Render Credits</h4>
                    <p className="stat-val">∞</p>
                    <span className="stat-tag">PRO PLAN</span>
                </div>
            </section>
        </div>
    );
}
