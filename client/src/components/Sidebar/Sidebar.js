import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    FiImage,
    FiType,
    FiStar,
    FiUser,
    FiFolder,
    FiHome,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import { FaGem } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [username, setUsername] = useState("Designer");

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/main`, {
                    method: "POST",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                    sessionStorage.setItem("username", data.username);
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };
        fetchUsername();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/logout`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                sessionStorage.removeItem("username");
                window.location.href = "/account/login";
            }
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const menuItems = [
        { path: "/account/main/home", icon: <FiHome />, label: "Home" },
        { path: "/account/main/image-to-image", icon: <FiImage />, label: "Sketch to Real" },
        { path: "/account/main/text-to-image", icon: <FiType />, label: "Text to Image" },
        { path: "/account/main/collections", icon: <FiFolder />, label: "Collections" },
        { path: "/account/main/favourites", icon: <FiStar />, label: "Favorites" }
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <FaGem className="diamond-icon" />
                {!isCollapsed && <span className="logo-text">Jewelify</span>}
                <div className="collapse-toggle">
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </div>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    {menuItems.map((item, i) => (
                        <li key={i}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => (isActive ? "active-link" : "")}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                {!isCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="profile-button glass"
                    onClick={() => setShowProfilePopup(!showProfilePopup)}
                >
                    <FiUser className="sidebar-icon" />
                    {!isCollapsed && <span>{username}</span>}
                </button>

                {showProfilePopup && (
                    <div className="profile-popup glass fade-in">
                        <div className="popup-header">
                            <div className="user-avatar">{username[0].toUpperCase()}</div>
                            <div className="user-info">
                                <h3>{username}</h3>
                                <p>Pro Designer</p>
                            </div>
                        </div>
                        <div className="popup-actions">
                            <button className="popup-btn" onClick={() => setShowProfilePopup(false)}>View Account</button>
                            <button className="popup-btn logout" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
