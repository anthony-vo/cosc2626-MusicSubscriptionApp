import React from "react";
import { Button } from "react-bootstrap";
import { FaUserCircle } from 'react-icons/fa'; // Using a random user icon
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../Components/Sidebar";

const Profile = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        window.location.href = "/login"; // Redirect to login page
    };

    return (
        <div className="text-white" style={{
            minHeight: "100vh",
            background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.9), rgba(0, 0, 0, 1))"
        }}>
            <div className="main-layout" style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: "20px" }}>
                    <h2 style={{ marginTop: "50px", textAlign: "center" }}>Your Profile</h2>
                    <div className="profile-content" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "left",
                        marginTop: "100px"
                    }}>
                        <FaUserCircle style={{
                            fontSize: "150px",
                            color: "white",
                            marginRight: "30px"
                        }} />

                        <div>
                            <h3>Welcome, {currentUser.username}</h3>
                            <p style={{ fontSize: "18px" }}>Number of Subscriptions: {currentUser.songs.length}</p>
                            <Button
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: "#9e19dc",
                                    borderColor: "#9e19dc",
                                    fontWeight: "bold",
                                    padding: "10px 20px",
                                    fontSize: "16px"
                                }}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
