import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import { Button, Container, Nav, Navbar, Spinner } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../Components/Sidebar";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState([]);

    const BASE_API_URL = "https://oc1t0cy4aj.execute-api.us-east-1.amazonaws.com/prod/getUser";

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser || !storedUser.email) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${BASE_API_URL}/${storedUser.email}`);
                const user = res.data;
                setCurrentUser(user);
                setSongs(user.songs || []);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="text-white" style={{ minHeight: "100vh", background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.9), rgba(0, 0, 0, 1))" }}>
                <div className="main-layout" style={{ display: "flex" }}>
                    <Sidebar />
                    <div className="content-area" style={{ flex: 1 }}>
                        <Navbar>
                            <Container fluid>
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                <Navbar.Collapse id="basic-navbar-nav">
                                    <Nav className="ms-auto">
                                        <Nav.Link disabled style={{ color: "white", display: "flex", alignItems: "center" }}>
                                            <Spinner animation="border" role="status" style={{ marginRight: "10px", color: "#9e19dc" }} />
                                            <span>Loading...</span>
                                        </Nav.Link>
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" style={{ marginTop: "100px", color: "#9e19dc" }} />
                            <h2>Loading your Profile...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white" style={{ minHeight: "100vh", background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.9), rgba(0, 0, 0, 1))" }}>
            <div className="main-layout" style={{ display: "flex" }}>
                <Sidebar />
                <div className="content-area" style={{ flex: 1 }}>
                    <Navbar>
                        <Container fluid>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="ms-auto">
                                    {currentUser ? (
                                        <Nav.Link disabled style={{ color: "white" }}>
                                            <FaUser style={{ marginRight: "8px" }} />
                                            Welcome, {currentUser.user_name}
                                        </Nav.Link>
                                    ) : (
                                        <Nav.Link as="a" href="/login" style={{ color: "#9e19dc", fontWeight: "bold" }}>
                                            Login
                                        </Nav.Link>
                                    )}
                                    {currentUser && (
                                        <Nav.Link onClick={handleLogout} style={{ color: "#9e19dc", fontWeight: "bold" }}>
                                            Logout
                                        </Nav.Link>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>

                    {currentUser ? (
                        <>
                            <h2 style={{ marginTop: "50px", textAlign: "center" }}>Your Profile</h2>
                            <div className="profile-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "left", marginTop: "100px" }}>
                                <img
                                    src={`https://api.dicebear.com/7.x/big-smile/svg?seed=${currentUser.user_name}`}
                                    alt="profile"
                                    style={{
                                        borderRadius: "50%",
                                        width: "120px",
                                        height: "120px",
                                        marginRight: "30px",
                                        backgroundColor: "white",
                                        padding: "5px",
                                    }}
                                />
                                <div>
                                    <h3>Welcome, {currentUser.user_name}</h3>
                                    <p style={{ fontSize: "18px" }}>
                                        Number of Subscriptions: {songs.length}
                                    </p>
                                    <Button
                                        onClick={handleLogout}
                                        style={{
                                            backgroundColor: "#9e19dc",
                                            borderColor: "#9e19dc",
                                            fontWeight: "bold",
                                            padding: "10px 20px",
                                            fontSize: "16px",
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Container className="py-5 text-center">
                            <h2>Unfortunately you are not logged in</h2>
                            <p>
                                Let's{" "}
                                <a href="/login" style={{ color: "#9e19dc", textDecoration: "underline" }}>
                                    login
                                </a>{" "}
                                or{" "}
                                <a href="/register" style={{ color: "#9e19dc", textDecoration: "underline" }}>
                                    register
                                </a>{" "}
                                to view your profile.
                            </p>
                        </Container>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
