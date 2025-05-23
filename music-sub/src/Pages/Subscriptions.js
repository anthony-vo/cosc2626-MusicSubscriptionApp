import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Navbar,
    Container,
    Nav,
    Card,
    Button,
    Row,
    Spinner,
} from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import { generatePresignedURL } from "../lambda-functions/musicAPI";

const BASE_API_URL =
    "https://oc1t0cy4aj.execute-api.us-east-1.amazonaws.com/prod";

const Subscriptions = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const user1 = JSON.parse(localStorage.getItem("currentUser"));

    useEffect(() => {
        if (!user1 || !user1.email) {
            setLoading(false);
            return;
        }

        const userEmail = user1.email;

        // Update the API call to use the /getUser/{userId} endpoint
        axios
            .get(`${BASE_API_URL}/getUser/${userEmail}`)
            .then(async (res) => {
                const user = res.data; // Assuming the response returns user directly
                setCurrentUser(user);
                const userSubscriptions = user.songs || [];
                const updatedSongsImage = await generatePresignedURL(userSubscriptions);
                setSongs(updatedSongsImage);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data: ", err);
                setLoading(false);
            });
    }, [navigate]);

    const handleRemove = async (songTitle, songAlbum) => {
        if (!currentUser || !currentUser.email) {
            console.error("No current user available. Cannot remove song.");
            return;
        }

        try {
            const res = await axios.delete(`${BASE_API_URL}/removeSong/${currentUser.email}`, {
                data: {
                    title: songTitle,
                    album: songAlbum,
                },
            });

            const updatedUser = res.data;
            const updatedSubscription = updatedUser.songs || [];
            const updatedSongsImage = await generatePresignedURL(updatedSubscription);
            setCurrentUser(updatedUser);
            setSongs(updatedSongsImage);
        } catch (err) {
            console.error("Error removing: ", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div
            className="text-white"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.9), rgba(0, 0, 0, 1))",
            }}
        >
            <div className="main-layout" style={{ display: "flex" }}>
                <Sidebar />
                <div className="content-area" style={{ flex: 1 }}>
                    <Navbar>
                        <Container fluid>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="ms-auto">
                                    {currentUser ? (
                                        <>
                                            <Nav.Link disabled style={{ color: "white" }}>
                                                <FaUser style={{ marginRight: "8px" }} />
                                                Welcome, {currentUser.user_name}
                                            </Nav.Link>
                                            <Nav.Link
                                                onClick={handleLogout}
                                                style={{ color: "#9e19dc", fontWeight: "bold" }}
                                            >
                                                Logout
                                            </Nav.Link>
                                        </>
                                    ) : (
                                        <Nav.Link
                                            onClick={handleLogin}
                                            style={{ color: "#9e19dc", fontWeight: "bold" }}
                                        >
                                            Login
                                        </Nav.Link>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>

                    <Container style={{ marginTop: 0 }} className="recent-subs">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner
                                    animation="border"
                                    role="status"
                                    style={{ marginBottom: "15px", color: "#9e19dc" }}
                                />
                                <h2>Loading your subscriptions...</h2>
                            </div>
                        ) : !currentUser ? (
                            <div className="text-center py-5">
                                <h2>Unfortunately you are not logged in</h2>
                                <p>
                                    Let's{" "}
                                    <Link
                                        to="/login"
                                        style={{ color: "#9e19dc", textDecoration: "underline" }}
                                    >
                                        login
                                    </Link>{" "}
                                    or{" "}
                                    <Link
                                        to="/register"
                                        style={{ color: "#9e19dc", textDecoration: "underline" }}
                                    >
                                        register
                                    </Link>{" "}
                                    to view your current subscription list.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2>Your Subscriptions</h2>
                                <div
                                    style={{
                                        maxHeight: "calc(100vh - 150px)",
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                    }}
                                >
                                    {songs.length > 0 ? (
                                        <Row>
                                            {songs.map((song, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        flexShrink: 0,
                                                        width: "250px",
                                                        scrollSnapAlign: "center",
                                                    }}
                                                >
                                                    <div className="morph-card-recent-subs">
                                                        <Card.Img
                                                            variant="top"
                                                            src={song.img_url}
                                                            alt={song.artist}
                                                            className="card-img"
                                                        />
                                                        <div className="morph-overlay">
                                                            <div className="card-back-content">
                                                                <h5 style={{ color: "purple" }}>{song.title}</h5>
                                                                <p>
                                                                    <strong>Artist:</strong> {song.artist}
                                                                    <br />
                                                                    <strong>Album:</strong> {song.album}
                                                                    <br />
                                                                    <strong>Year:</strong> {song.year}
                                                                </p>
                                                                <Button
                                                                    className={
                                                                        songs.some((s) => s.title === song.title)
                                                                            ? "btn-danger"
                                                                            : "btn-purple"
                                                                    }
                                                                    onClick={() => handleRemove(song.title, song.album)}
                                                                >
                                                                    {songs.some((s) => s.title === song.title)
                                                                        ? "Unsubscribe"
                                                                        : "Subscribe"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p
                                                        style={{
                                                            marginTop: 5,
                                                            marginBottom: 0,
                                                            fontSize: 16,
                                                        }}
                                                    >
                                                        {song.title}
                                                    </p>
                                                </div>
                                            ))}
                                        </Row>
                                    ) : (
                                        <p style={{ textAlign: "center", marginTop: "20px" }}>
                                            You don't have any subscriptions yet!
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
