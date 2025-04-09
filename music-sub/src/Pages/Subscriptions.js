import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Card, Button, Row } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import { generatePresignedURL } from "../api/musicAPI";

const BASE_API_URL =
  "https://xtb9qbsb71.execute-api.us-east-1.amazonaws.com/Production/fetch";

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);

  //Hardcoded user for testing purpose

  const userEmail = "s39224062@student.rmit.edu.au";

  useEffect(() => {
    axios
      .post(BASE_API_URL, { type: "getUserSubscription", id: userEmail })
      .then(async (res) => {
        console.log("API Response:", res.data);
        const parsedBody = JSON.parse(res.data.body);
        const user = parsedBody.user;
        setCurrentUser(user);
        const userSubscriptions = user.songs || [];
        const updatedSongsImage = await generatePresignedURL(userSubscriptions);
        setSongs(updatedSongsImage);
      })
      .catch((err) => {
        console.error("Error fetching data: ", err);
        navigate("/login");
      });
  }, [navigate, userEmail]);

  const handleRemove = (songTitle, songAlbum) => {
    axios
      .delete(
        `${BASE_API_URL}/Task5LambdaRemoveSong/${encodeURIComponent(
          currentUser.email
        )}`,
        {
          data: { title: songTitle, album: songAlbum },
        }
      )
      .then(async (res) => {
        const updatedUser = res.data;
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div
      className="text-white"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, rgba(10, 10, 10, 0.9), rgba(0, 0, 0, 1))",
      }}
    >
      <div className="main-layout" style={{ display: "flex" }}>
        <Sidebar />
        <div className="content-area">
          <Navbar>
            <Container fluid>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                  {currentUser && (
                    <Nav.Link disabled style={{ color: "white" }}>
                      <FaUser style={{ marginRight: "8px" }} />
                      Welcome, {currentUser.username}
                    </Nav.Link>
                  )}
                  <Nav.Link
                    onClick={handleLogout}
                    style={{ color: "#9e19dc", fontWeight: "bold" }}
                  >
                    Logout
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          <Container style={{ marginTop: 0 }} className="recent-subs">
            <h2>Your Subscriptions</h2>
            <div
              style={{
                maxHeight: "calc(100vh - 150px)", // Make it scrollable
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
                              onClick={() => handleRemove(song.title)}
                            >
                              {songs.some((s) => s.title === song.title)
                                ? "Unsubscribe"
                                : "Subscribe"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p
                        style={{ marginTop: 5, marginBottom: 0, fontSize: 16 }}
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
          </Container>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
