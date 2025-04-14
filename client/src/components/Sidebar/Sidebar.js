import React, {useState, useEffect} from "react";
import {NavLink} from "react-router-dom";
import {
    AiOutlinePicture,
    AiOutlineFontSize,
    AiOutlineStar,
    AiOutlineUser,
    AiOutlineAppstore,
    AiOutlineHome,
} from "react-icons/ai";
import {FaGem} from "react-icons/fa"; // Diamond logo
import "./Sidebar.css";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [username, setUsername] = useState("Guest");

    // Fetch username and manage session
    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch("http://localhost:8001/user/main", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unauthorized access");
                }

                const data = await response.json();
                setUsername(data.username);
                sessionStorage.setItem("username", data.username);
            } catch (error) {
                console.error("Error fetching username:", error);
                setUsername("Guest");
            }
        };

        fetchUsername();
    }, []);

    // Handle logout logic
    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8001/user/logout", {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });

            const result = await response.json();
            if (response.ok) {
                sessionStorage.removeItem("username");
                alert("Logout successful!");
                window.location.href = "/account/login";
            } else {
                alert(result.error || "Logout failed.");
            }
        } catch (error) {
            console.error("Logout Error:", error);
            alert("An error occurred during logout.");
        }
    };

    // Sidebar collapse toggle
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header" onClick={toggleSidebar}>
                <FaGem className="diamond-icon"/>
                {!isCollapsed && <span className="logo-text">ProjectJ</span>}
            </div>

            {/* Sidebar Menu */}
            <ul className="sidebar-menu">
                <li>
                    <NavLink
                        to="/account/main/home"
                        className={({isActive}) => (isActive ? "active-link" : "")}
                    >
                        <AiOutlineHome className="sidebar-icon"/>
                        {!isCollapsed && <span>Home</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/account/main/image-to-image"
                        className={({isActive}) => (isActive ? "active-link" : "")}
                    >
                        <AiOutlinePicture className="sidebar-icon"/>
                        {!isCollapsed && <span>Sketch to Real</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/account/main/text-to-image"
                        className={({isActive}) => (isActive ? "active-link" : "")}
                    >
                        <AiOutlineFontSize className="sidebar-icon"/>
                        {!isCollapsed && <span>Text to Image</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/account/main/collections"
                        className={({isActive}) => (isActive ? "active-link" : "")}
                    >
                        <AiOutlineAppstore className="sidebar-icon"/>
                        {!isCollapsed && <span>Collections</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/account/main/favourites"
                        className={({isActive}) => (isActive ? "active-link" : "")}
                    >
                        <AiOutlineStar className="sidebar-icon"/>
                        {!isCollapsed && <span>Favorites</span>}
                    </NavLink>
                </li>
            </ul>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <button
                    className="profile-button"
                    onClick={() => setShowProfilePopup(!showProfilePopup)}
                >
                    <AiOutlineUser className="sidebar-icon"/>
                    {!isCollapsed && <span>Profile</span>}
                </button>

                {/* Profile Popup */}
                {showProfilePopup && (
                    <div className="profile-popup">
                        <div className="popup-content">
                            <h3 className="text-dark">Profile</h3>
                            <p>Username: {username}</p>
                            <button
                                className="popup-button logout-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                            <button
                                className="popup-button close-popup-button"
                                onClick={() => setShowProfilePopup(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
