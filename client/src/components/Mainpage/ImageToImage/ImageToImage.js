import React, {useState, useEffect, useRef} from "react";
import { FiPlus, FiCamera, FiUpload, FiX, FiZap, FiLayers } from "react-icons/fi";
import "./ImageToImage.css";

export default function ImageToImage() {
    const [inputImage, setInputImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showOptionsPopup, setShowOptionsPopup] = useState(false);
    const [showPromptPopup, setShowPromptPopup] = useState(false);
    const [showWebcamPopup, setShowWebcamPopup] = useState(false);
    const [username, setUsername] = useState(sessionStorage.getItem("username") || "Designer");
    const [fileToProcess, setFileToProcess] = useState(null);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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
        if (!sessionStorage.getItem("username")) fetchUsername();
    }, []);

    const handleUpload = (imageFile) => {
        if (imageFile) {
            setInputImage(URL.createObjectURL(imageFile));
            setFileToProcess(imageFile);
            setProcessedImage(null);
        }
    };

    const handleProcess = () => {
        if (!fileToProcess) return;
        setShowPromptPopup(true);
    };

    const submitProcess = async (promptId) => {
        setShowPromptPopup(false);
        const formData = new FormData();
        formData.append("image", fileToProcess);
        formData.append("username", username);
        formData.append("prompt_id", promptId.toString());

        try {
            setLoading(true);
            setProcessing(true);
            const response = await fetch(`${process.env.REACT_APP_FLASK_API_URL || 'http://localhost:5000'}/api/upload`, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                const processedImageUrl = result.processedImage.startsWith("data:")
                    ? result.processedImage
                    : `${process.env.REACT_APP_FLASK_API_URL || 'http://localhost:5000'}/processed/${result.processedImage}`;
                setProcessedImage(processedImageUrl);
            } else {
                console.error("Processing error");
            }
        } catch (error) {
            console.error("Processing failed", error);
        } finally {
            setLoading(false);
            setProcessing(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) handleUpload(file);
        setShowOptionsPopup(false);
    };

    const startWebcam = async () => {
        setShowOptionsPopup(false);
        setShowWebcamPopup(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (error) {
            console.error("Webcam error", error);
        }
    };

    const stopWebcam = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setShowWebcamPopup(false);
    };

    const captureImage = async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const blob = await fetch(canvas.toDataURL("image/png")).then(res => res.blob());
            handleUpload(new File([blob], "capture.png", {type: "image/png"}));
            stopWebcam();
        }
    };

    const materials = [
        { id: 1, name: "Pure Diamond", icon: "💎", color: "#e2e8f0" },
        { id: 2, name: "Sapphire/Gem", icon: "💠", color: "#6366f1" },
        { id: 3, name: "Platinum 950", icon: "💍", color: "#94a3b8" },
        { id: 4, name: "24K Gold", icon: "✨", color: "#f59e0b" },
    ];

    return (
        <div className="image-to-image-container fade-in">
            <header className="page-header">
                <h2 className="page-title">Sketch to Real</h2>
                <p className="welcome-text">Transform hand-drawn concepts into professional-grade renders.</p>
            </header>

            <div className="im2im-grid">
                <div className="im2im-card glass-hover">
                    <div className="card-header-main">
                        <FiLayers /> <h3>Original Sketch</h3>
                    </div>
                    <div className="preview-box" onClick={() => !inputImage && setShowOptionsPopup(true)}>
                        {inputImage ? (
                            <img src={inputImage} alt="Input" className="img-full"/>
                        ) : (
                            <div className="empty-placeholder">
                                <FiUpload className="placeholder-icon" />
                                <p>Click to provide your sketch</p>
                                <span>PNG or JPG preferred</span>
                            </div>
                        )}
                        <button className="abs-plus-btn" onClick={(e) => { e.stopPropagation(); setShowOptionsPopup(true); }}>
                            <FiPlus />
                        </button>
                    </div>
                </div>

                <div className="im2im-card glass-hover">
                    <div className="card-header-main">
                        <FiZap /> <h3>Realistic Render</h3>
                    </div>
                    <div className="preview-box">
                        {processing ? (
                            <div className="processing-state">
                                <div className="spinner-lg"></div>
                                <p>Applying materials and lighting...</p>
                            </div>
                        ) : processedImage ? (
                            <img src={processedImage} alt="Processed" className="img-full"/>
                        ) : (
                            <div className="empty-placeholder">
                                <FiZap className="placeholder-icon muted" />
                                <p>Transformation will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="main-action-area">
                <button 
                    className="generate-btn-premium" 
                    onClick={handleProcess} 
                    disabled={!fileToProcess || loading}
                >
                    {loading ? <div className="spinner-white"></div> : <><FiZap /> <span>Generate Masterpiece</span></>}
                </button>
            </div>

            {/* Overlays */}
            {showOptionsPopup && (
                <div className="overlay-blur" onClick={() => setShowOptionsPopup(false)}>
                    <div className="premium-popup" onClick={e => e.stopPropagation()}>
                        <h3>Input Method</h3>
                        <div className="btn-stack">
                            <button className="pop-action-btn" onClick={() => document.getElementById("hiddenInput").click()}>
                                <FiUpload /> <span>Upload from Device</span>
                            </button>
                            <button className="pop-action-btn" onClick={startWebcam}>
                                <FiCamera /> <span>Capture from Webcam</span>
                            </button>
                            <button className="pop-action-btn cancel" onClick={() => setShowOptionsPopup(false)}>Cancel</button>
                        </div>
                        <input type="file" id="hiddenInput" hidden accept="image/*" onChange={handleFileUpload} />
                    </div>
                </div>
            )}

            {showPromptPopup && (
                <div className="overlay-blur" onClick={() => setShowPromptPopup(false)}>
                    <div className="premium-popup material-popup" onClick={e => e.stopPropagation()}>
                        <h3>Select Material Preset</h3>
                        <div className="material-grid">
                            {materials.map(m => (
                                <button key={m.id} className="material-btn" onClick={() => submitProcess(m.id)}>
                                    <span className="mat-icon">{m.icon}</span>
                                    <span className="mat-name">{m.name}</span>
                                </button>
                            ))}
                        </div>
                        <button className="pop-action-btn cancel" onClick={() => setShowPromptPopup(false)}>Go Back</button>
                    </div>
                </div>
            )}

            {showWebcamPopup && (
                <div className="overlay-blur">
                    <div className="premium-popup webcam-popup" onClick={e => e.stopPropagation()}>
                        <h3>Webcam Capture</h3>
                        <div className="cam-view">
                            <video ref={videoRef} autoPlay />
                            <canvas ref={canvasRef} hidden />
                        </div>
                        <div className="btn-stack-row">
                            <button className="pop-action-btn" onClick={captureImage}><FiCamera /> Capture</button>
                            <button className="pop-action-btn cancel" onClick={stopWebcam}><FiX /> Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}