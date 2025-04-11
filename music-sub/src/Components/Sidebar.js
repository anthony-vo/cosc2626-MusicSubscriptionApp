// components/Sidebar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaMusic, FaCompactDisc  } from "react-icons/fa";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeStyle = (path) => ({
        color: location.pathname === path ? "#9e19dc" : "white",
    });

    return (
        <div className="sidebar">
            <div className="logo"> <FaCompactDisc /> Beatify</div>
            <button onClick={() => navigate("/")} style={activeStyle("/")}>
                <FaHome /> Home
            </button>
            <button onClick={() => navigate("/subscriptions")} style={activeStyle("/subscriptions")}>
                <FaMusic /> Subscriptions
            </button>
            <button onClick={() => navigate("/profile")} style={activeStyle("/profile")}>
                <FaUser /> Profile
            </button>
        </div>
    );
};

export default Sidebar;
