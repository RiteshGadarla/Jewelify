import React, {useState, useEffect} from "react";
import { FiWind, FiSend, FiDownload, FiInfo, FiTrash2, FiImage } from "react-icons/fi";
import { AiOutlineThunderbolt } from "react-icons/ai";
import "./TextToImage.css";

export default function TextToImage() {
    const [textPrompt, setTextPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [username, setUsername] = useState(sessionStorage.getItem("username") || "Designer");
    
    // Configuration - Replaced with env or placeholders
    const API_TOKEN = process.env.REACT_APP_HF_API_TOKEN || ""; 
    const modelUrl = process.env.REACT_APP_TEXT_MODEL_URL || "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

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
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };
        if (!sessionStorage.getItem("username")) fetchUsername();
    }, []);

    const handleGenerateImage = async () => {
        if (!textPrompt.trim()) return;

        setLoading(true);
        setGeneratedImage(null);

        try {
            const response = await fetch(modelUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `luxury jewelry, high professional photography, ${textPrompt}`,
                    options: {wait_for_model: true},
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setGeneratedImage(imageUrl);
                
                // Optional: Save to backend
                const file = new File([blob], "generated_jewelry.png", {type: "image/png"});
                await saveImage(file, username);
            } else {
                console.error("Generation failed");
            }
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveImage = async (file, username) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("username", username);

        try {
            await fetch(`${process.env.REACT_APP_FLASK_API_URL || 'http://localhost:5000'}/api/text-image-save`, {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.error("Error saving image:", error);
        }
    };

    const clearPrompt = () => setTextPrompt("");

    return (
        <div className="text-to-image-container fade-in">
            <header className="page-header">
                <h2 className="page-title">Vision to Design</h2>
                <p className="welcome-text">Describe your dream jewelry and let our AI bring it to life instantly.</p>
            </header>

            <div className="txt-main-grid">
                {/* Input Card */}
                <div className="prompt-card glass-hover">
                    <div className="card-header">
                        <FiWind className="header-icon" />
                        <h3>Prompt Specification</h3>
                    </div>
                    
                    <div className="textarea-wrapper">
                        <textarea
                            className="text-prompt-field"
                            placeholder="e.g. An organic gold ring with raw emerald crystals, cinematic lighting, ultra-detailed..."
                            value={textPrompt}
                            onChange={(e) => setTextPrompt(e.target.value)}
                        />
                        {textPrompt && (
                            <button className="clear-btn" onClick={clearPrompt}>
                                <FiTrash2 />
                            </button>
                        )}
                    </div>

                    <div className="prompt-tips">
                        <FiInfo />
                        <span>Tip: Use words like 'royal', '4k', 'diamonds' for better results.</span>
                    </div>

                    <button 
                        className="generate-button-main" 
                        onClick={handleGenerateImage} 
                        disabled={loading || !textPrompt.trim()}
                    >
                        {loading ? (
                            <div className="spinner-white"></div>
                        ) : (
                            <><FiSend /> <span>Generate Vision</span></>
                        )}
                    </button>
                </div>

                {/* Result Card */}
                <div className="result-card glass-hover">
                    <div className="card-header">
                        <AiOutlineThunderbolt className="header-icon" />
                        <h3>Generated Masterpiece</h3>
                    </div>

                    <div className="result-preview-wrapper">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner-lg"></div>
                                <p>Crystallizing your vision...</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="image-action-wrapper">
                                <img src={generatedImage} alt="Generated" className="final-image"/>
                                <a href={generatedImage} download="jewelry-design.png" className="download-fab">
                                    <FiDownload />
                                </a>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FiImage className="empty-icon" />
                                <p>Your creation will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
