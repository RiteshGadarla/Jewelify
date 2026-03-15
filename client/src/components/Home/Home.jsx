import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-scroll";
import { HiOutlineArrowRight } from "react-icons/hi";
import { FiCpu, FiLayout, FiZap, FiCheckCircle } from "react-icons/fi";
import "./style.css";
import HeroJewelry from "./hero-jewelry.png";

export default function Home() {
    const [username, setUsername] = useState();
    const [showOptions, setShowOptions] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = () => setShowOptions(!showOptions);

    async function handleLogout() {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/logout`, {
                method: "POST",
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                sessionStorage.clear();
                window.location.reload();
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/main`, {
                    method: "POST",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchData();
    }, []);

    const toggleFaq = (e) => {
        e.currentTarget.classList.toggle("active");
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav glass">
                <div className="nav-container">
                    <a className="nav-brand" href="/">Jewelify</a>
                    
                    <div className="nav-links">
                        <Link to="hero" smooth={true} className="nav-link">Home</Link>
                        <Link to="features" smooth={true} className="nav-link">Features</Link>
                        <Link to="how-it-works" smooth={true} className="nav-link">How it Works</Link>
                    </div>

                    <div className="nav-auth">
                        {username ? (
                            <div className="user-profile" onClick={handleProfileClick}>
                                {username[0].toUpperCase()}
                                {showOptions && (
                                    <div className="user-dropdown glass">
                                        <button className="dropdown-item" onClick={() => navigate('/account/main/home')}>Dashboard</button>
                                        <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="btn-premium btn-premium-primary" onClick={() => navigate('/account/login')}>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <header id="hero" className="hero-section">
                <div className="hero-container">
                    <div className="hero-content fade-in-left">
                        <div className="badge">AI-Powered Jewelry Design</div>
                        <h1>Turn Sketches into <span className="text-gradient">Masterpieces</span></h1>
                        <p>
                            Jewelify uses state-of-the-art Generative Adversarial Networks (GANs) to transform your hand-drawn concepts into photorealistic, production-ready jewelry designs in seconds.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-premium btn-premium-primary" onClick={() => navigate(username ? '/account/main/home' : '/account/signup')}>
                                Start Creating <HiOutlineArrowRight className="btn-icon" />
                            </button>
                            <button className="btn-premium btn-premium-outline">Watch Demo</button>
                        </div>
                        <div className="trust-badges">
                            <span>Trusted by 500+ Designers</span>
                            <div className="stars">★★★★★</div>
                        </div>
                    </div>
                    <div className="hero-visual fade-in-right">
                        <div className="image-stack">
                            <img src={HeroJewelry} alt="AI Jewelry" className="main-image shadow-premium" />
                            <div className="glass-card overlay-card">
                                <FiZap className="card-icon" />
                                <div>
                                    <h4>Instant Render</h4>
                                    <p>Ready in 2.4s</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="stats-section">
                <div className="stats-container glass">
                    <div className="stat-item">
                        <h3>10k+</h3>
                        <p>Designs Generated</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h3>99%</h3>
                        <p>Realism Accuracy</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h3>24/7</h3>
                        <p>AI Availability</p>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Advanced Capabilities</h2>
                    <p>Designed for professional jewelers and passionate hobbyists alike.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card glass-hover">
                        <div className="feature-icon-wrapper"><FiCpu /></div>
                        <h3>GAN-Powered Logic</h3>
                        <p>Proprietary neural networks specifically trained on hundreds of thousands of jewelry datasets for perfect anatomy.</p>
                    </div>
                    <div className="feature-card glass-hover active">
                        <div className="feature-icon-wrapper"><FiLayout /></div>
                        <h3>Material Simulation</h3>
                        <p>Photorealistic rendering of over 50+ precious metals and 100+ gemstones with physical light properties.</p>
                    </div>
                    <div className="feature-card glass-hover">
                        <div className="feature-icon-wrapper"><FiCheckCircle /></div>
                        <h3>Production Ready</h3>
                        <p>Export in high resolution suitable for direct marketing materials or client presentations.</p>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>The Creative Process</h2>
                    </div>
                    <div className="process-steps">
                        <div className="step">
                            <div className="step-number">01</div>
                            <h4>Upload Sketch</h4>
                            <p>Upload any hand-drawn sketch or photo of a rough outline.</p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">02</div>
                            <h4>AI Transformation</h4>
                            <p>Our GAN engine interprets textures, lighting, and materials.</p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">03</div>
                            <h4>Professional Result</h4>
                            <p>Download your photorealistic masterpiece in 4K resolution.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-container glass">
                    <h2>Ready to reshape the future of jewelry?</h2>
                    <p>Join thousands of designers who are already using Jewelify to bring their visions to life.</p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                    <button 
                        className="btn-premium btn-premium-primary" 
                        onClick={() => navigate('/account/signup')}
                    >
                        Create Free Account
                    </button>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <a className="nav-brand" href="/">Jewelify</a>
                        <p>Innovating the jewelry industry through the power of Generative AI.</p>
                    </div>
                    <div className="footer-nav">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="#">Features</a>
                            <a href="#">Pricing</a>
                            <a href="#">Showcase</a>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="#">About Us</a>
                            <a href="#">Blog</a>
                            <a href="#">Careers</a>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Cookie Policy</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Jewelify Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
