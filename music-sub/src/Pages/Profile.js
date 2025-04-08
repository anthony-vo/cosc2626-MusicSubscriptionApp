import React from "react";
import {Button, Container, Nav, Navbar} from "react-bootstrap";
import {FaUser,} from 'react-icons/fa';
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
                <div className="content-area">
                    <Navbar>
                        <Container fluid>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="ms-auto">
                                    {currentUser && (
                                        <Nav.Link disabled style={{ color: 'white' }}>
                                            <FaUser style={{ marginRight: '8px' }} />
                                            Welcome, {currentUser.username}
                                        </Nav.Link>
                                    )}
                                    <Nav.Link onClick={handleLogout} style={{ color: '#9e19dc', fontWeight: 'bold' }}>
                                        Logout
                                    </Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                    <h2 style={{ marginTop: "50px", textAlign: "center" }}>Your Profile</h2>
                    <div className="profile-content" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "left",
                        marginTop: "100px"
                    }}>
                        <img
                            src={`https://api.dicebear.com/7.x/big-smile/svg?seed=${currentUser.username}`}
                            alt="profile"
                            style={{
                                borderRadius: '50%',
                                width: '120px',
                                height: '120px',
                                marginRight: '30px',
                                backgroundColor: 'white',
                                padding: '5px'
                            }}
                        />

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
