import React, {useState} from "react";
import "./ImageGallery.css";
import {AiOutlineHeart, AiFillHeart, AiOutlineDelete, AiOutlineClose} from "react-icons/ai";

export default function ImageGallery({
                                         images,
                                         username,
                                         onLike,
                                         onDelete,
                                         showOnlyLiked = false
                                     }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const filteredImages = showOnlyLiked
        ? images.filter(img => img.includes("liked"))
        : images;

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedImageIndex(null);
    };

    const isLiked = (imageSrc) => {
        return imageSrc ? imageSrc.includes("liked") : false;
    };

    const currentImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

    return (
        <div className="gallery-wrapper">
            <div className="image-grid">
                {filteredImages.length > 0 ? (
                    filteredImages.map((image, index) => (
                        <div key={index} className="image-card" onClick={() => handleImageClick(index)}>
                            <img src={image} alt={`Processed ${index}`} className="gallery-image"/>
                            <div className="image-overlay">
                                {isLiked(image) ? (
                                    <AiFillHeart className="overlay-icon liked"/>
                                ) : (
                                    <AiOutlineHeart className="overlay-icon"/>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No images found in your collection.</p>
                    </div>
                )}
            </div>

            {showPopup && currentImage && (
                <div className="modal-overlay" onClick={closePopup}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closePopup}>
                            <AiOutlineClose/>
                        </button>
                        <div className="modal-content">
                            <div className="modal-image-wrapper">
                                <img src={currentImage} alt="Full Size View" className="modal-image"/>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className={`modal-action-btn like-btn ${isLiked(currentImage) ? "active" : ""}`}
                                    onClick={() => onLike(currentImage, selectedImageIndex, filteredImages)}
                                >
                                    {isLiked(currentImage) ? <AiFillHeart/> : <AiOutlineHeart/>}
                                    <span>{isLiked(currentImage) ? "Liked" : "Like"}</span>
                                </button>
                                <button
                                    className="modal-action-btn delete-btn"
                                    onClick={() => {
                                        onDelete(currentImage);
                                        closePopup();
                                    }}
                                >
                                    <AiOutlineDelete/>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
