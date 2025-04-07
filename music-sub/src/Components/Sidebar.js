// components/Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaMusic } from "react-icons/fa";

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <div className="logo">🎵 MyMusicApp</div>
            <button onClick={() => navigate("/")}>
                <FaHome /> Home
            </button>
            <button onClick={() => navigate("/subscriptions")}>
                <FaMusic /> Subscriptions
            </button>
            <button onClick={() => navigate("/profile")}>
                <FaUser /> Profile
            </button>
        </div>
    );
};

export default Sidebar;