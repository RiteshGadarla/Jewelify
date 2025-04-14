import React, {useState, useEffect} from "react";
import "./Collections.css";

export default function Collection() {
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Track selected image index
    const [newSrc, setNewSrc] = useState();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user session
                const userResponse = await fetch("http://localhost:8001/user/check", {
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
                    `http://localhost:8001/user/collection/${user.username}`
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

    if (loading) {
        return <div className="collection-container">Loading user data....{username}</div>;
    }

    if (error) {
        return <div className="collection-container">Error: {error}</div>;
    }

    function pop(event, index) {
        const clickedImage = event.target;
        const popImage = document.querySelector(".popup img");
        const popup = document.querySelector(".popup");
        popImage.src = clickedImage.src;
        popup.classList.add("show-popup"); // Add class to show popup
        document.querySelector(".image-gallery").classList.add("blurred");
        setSelectedImageIndex(index); // Set selected image index
    }

    function close() {
        const popup = document.querySelector(".popup");
        popup.classList.remove("show-popup"); // Remove class to hide popup
        document.querySelector(".image-gallery").classList.remove("blurred");
    }


    const likeImage = async () => {
        if (selectedImageIndex === null) return;

        const imageSrc = images[selectedImageIndex];
        let updatedSrc;

        // Check if the image is already liked
        if (imageSrc.includes("liked")) {
            // Remove the "liked" part of the filename
            updatedSrc = imageSrc.replace("liked_", "");
            console.log("image:", updatedSrc);

        } else {
            // Add "liked" part to the filename
            const newFilename = `liked_${imageSrc.split("/").pop()}`;
            updatedSrc = imageSrc.replace(imageSrc.split("/").pop(), newFilename);
            console.log("image:", updatedSrc);
        }

        try {
            const response = await fetch("http://localhost:8001/user/api/like-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, oldSrc: imageSrc, newSrc: updatedSrc}),
            });

            if (!response.ok) {
                throw new Error(`Failed to like/unlike image: ${response.statusText}`);
            }

            // Update the local state with the new image URL
            setImages((prevImages) =>
                prevImages.map((img, idx) => (idx === selectedImageIndex ? updatedSrc : img))
            );

        } catch (error) {
            console.error("Error liking/unliking image:", error);
            alert("Failed to update the image.");
        }
    };

    async function deleteImage() {
        const popup = document.querySelector(".popup");
        const imageSrc = popup.querySelector("img").src;

        const filename = imageSrc.split("/").pop();

        try {
            const response = await fetch("http://localhost:8001/user/api/delete-image", {
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
            close();
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete the image.");
        }
    }

    const isLiked = (imageSrc) => {
        console.log("image", imageSrc);
        return imageSrc ? imageSrc.includes("liked") : false;
    };

    return (
        <div className="collection-container">
            {username ? (
                <>
                    <div className="welcome">
                        <h1>Welcome, {username}!</h1>
                        <p className="description">Explore your beautifully processed images below.</p>
                    </div>

                    <div id="image-gallery" className="image-gallery">
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Processed ${image}`}
                                    className="image-item"
                                    width={200}
                                    height={210}
                                    onClick={(event) => pop(event, index)}
                                />
                            ))
                        ) : (
                            <p>No images found in your collection.</p>
                        )}
                    </div>

                    <div className="popup">
                        <div className="popup-incontainer">
                            <img src="" alt="Full Size View"/>
                            <div className="actions">
                                <button className="action-button like-button" onClick={likeImage}>
                                    <i className={`fas fa-heart ${isLiked(images[selectedImageIndex]) ? "liked-icon" : ""}`}></i>
                                    {isLiked(images[selectedImageIndex]) ? "Unlike" : "Like"}
                                </button>
                                <button className="action-button delete-button" onClick={deleteImage}>
                                    <i className="fas fa-trash"></i> Delete
                                </button>
                                <button className="action-button close-button" onClick={close}>
                                    <i className="fas fa-times"></i> Close
                                </button>
                            </div>
                        </div>
                    </div>

                </>
            ) : (
                <div className="not-found">
                    <h1 className="status">404</h1>
                    <h2>Not Found</h2>
                </div>
            )}
        </div>
    );
}