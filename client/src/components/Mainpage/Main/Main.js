import React, {useState, useEffect} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import Sidebar from "../../Sidebar/Sidebar";
import "./Main.css";

export default function Main() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/main`, {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unauthorized access");
                }

                const data = await response.json();
                setUsername(data.username);
            } catch (error) {
                console.error("Failed to fetch main page data:", error);
                navigate("/account/login");
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/user/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            
            if (response.ok) {
                sessionStorage.clear();
                window.location.href = "/account/login";
            } else {
                alert(result.error || "Logout failed.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout.");
        }
    };

    return (
        <div className="main-container">
            <Sidebar username={username} handleLogout={handleLogout}/>
            <div className="content">
                <Outlet/>
            </div>
        </div>
    );
}
 