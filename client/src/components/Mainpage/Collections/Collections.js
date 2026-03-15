import React, {useState, useEffect} from "react";
import "./Collections.css";
import ImageGallery from "../Shared/ImageGallery";

export default function Collection() {
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user session
                const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/check`, {
                    credentials: "include",
                });

                if (!userResponse.ok) {
                    throw new Error(`User API returned status: ${userResponse.status}`);
                }

                const {user} = await userResponse.json();
                if (!user?.username) {
                    throw new Error("Username is missing in the user data");
                }

                setUsername(user.username);

                // Fetch list of processed image URLs
                const imageResponse = await fetch(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/collection/${user.username}`
                );

                if (!imageResponse.ok) {
                    throw new Error(`Images API returned status: ${imageResponse.status}`);
                }

                const imageList = await imageResponse.json();

                if (!Array.isArray(imageList)) {
                    throw new Error("Images API did not return a valid array");
                }

                setImages(imageList);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const likeImage = async (imageSrc, index, filteredImages) => {
        let updatedSrc;

        if (imageSrc.includes("liked")) {
            updatedSrc = imageSrc.replace("liked_", "");
        } else {
            const newFilename = `liked_${imageSrc.split("/").pop()}`;
            updatedSrc = imageSrc.replace(imageSrc.split("/").pop(), newFilename);
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/api/like-image`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, oldSrc: imageSrc, newSrc: updatedSrc}),
            });

            if (!response.ok) {
                throw new Error(`Failed to like/unlike image: ${response.statusText}`);
            }

            setImages((prevImages) =>
                prevImages.map((img) => (img === imageSrc ? updatedSrc : img))
            );

        } catch (error) {
            console.error("Error liking/unliking image:", error);
            alert("Failed to update the image.");
        }
    };

    const deleteImage = async (imageSrc) => {
        const filename = imageSrc.split("/").pop();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/api/delete-image`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, filename}),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete image: ${response.statusText}`);
            }

            setImages((prevImages) => prevImages.filter((img) => img !== imageSrc));
            alert("Image deleted successfully.");
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete the image.");
        }
    };

    if (loading) {
        return (
            <div className="collection-container loading-state">
                <div className="spinner"></div>
                <p>Retrieving your treasures...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="collection-container error-state">
                <h2>Oops! Something went wrong.</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="collection-container">
            {username ? (
                <div className="gallery-section">
                    <header className="gallery-header">
                        <h1>Your Collection</h1>
                        <p className="text-secondary">Explore all your beautifully processed designs.</p>
                    </header>

                    <ImageGallery
                        images={images}
                        username={username}
                        onLike={likeImage}
                        onDelete={deleteImage}
                        showOnlyLiked={false}
                    />
                </div>
            ) : (
                <div className="not-found">
                    <h1 className="status">404</h1>
                    <h2>Not Found</h2>
                </div>
            )}
        </div>
    );
}