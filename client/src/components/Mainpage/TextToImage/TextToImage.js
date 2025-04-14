import React, {useState, useEffect} from "react";
import "./TextToImage.css";

export default function TextToImage() {
    const [textPrompt, setTextPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [username, setUsername] = useState(sessionStorage.getItem("username") || "guest");
    const API_TOKEN = ""; //Your token here
    const modelUrl = ""; ///Your Stable Diffusion Model

    // Fetch username dynamically on component mount
    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch("http://localhost:8001/user/details", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username || "guest");
                    sessionStorage.setItem("username", data.username || "guest");
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };

        if (!sessionStorage.getItem("username")) {
            fetchUsername();
        }
    }, []);

    const handleGenerateImage = async () => {
        if (!textPrompt.trim()) {
            alert("Please enter a text prompt!");
            return;
        }

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
                    inputs: textPrompt,
                    options: {wait_for_model: true},
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const file = new File([blob], "generated_image.png", {type: "image/png"});
                const imageUrl = URL.createObjectURL(blob);
                setGeneratedImage(imageUrl);

                await saveImage(file, username);
            } else {
                const errorText = await response.text();
                alert(`Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("An error occurred while generating the image.");
        } finally {
            setLoading(false);
        }
    };

    const saveImage = async (file, username) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("username", username);

        try {
            const response = await fetch("http://localhost:5000/api/text-image-save", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Image saved successfully at: ${result.processedImage}`);
            } else {
                const errorText = await response.text();
                console.error("Error saving image:", errorText);
                alert("Failed to save the image and username.");
            }
        } catch (error) {
            console.error("Error saving image:", error);
            alert("An error occurred while saving the image.");
        }
    };

    return (
        <div className="text-to-image-container">
            <h2 className="page-title">Text to Image Generation</h2>
            <textarea
                className="text-prompt"
                placeholder="Enter your text prompt here..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
            />
            <div className="button-container">
                <button className="generate-button" onClick={handleGenerateImage} disabled={loading}>
                    {loading ? "Generating..." : "Generate Image"}
                </button>
            </div>
            {generatedImage && (
                <div className="image-preview-container">
                    <h3>Generated Image</h3>
                    <img src={generatedImage} alt="Generated" className="generated-image"/>
                </div>
            )}
        </div>
    );
}
