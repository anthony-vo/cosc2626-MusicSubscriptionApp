import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  Card,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import { convertSongsWithPresignedURL } from "../api/musicAPI";

const BASE_API_URL =
  "https://ziwqlob0vj.execute-api.us-east-1.amazonaws.com/Production";

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);

  //Hardcoded user for testing purpose

  const userEmail = "s39224062@student.rmit.edu.au";

  useEffect(() => {
    axios
      .get(
        `${BASE_API_URL}/Task5LambdaGetUser/${encodeURIComponent(userEmail)}`
      )
      .then(async (res) => {
        const user = res.data;
        setCurrentUser(user);
        const userSubscriptions = user.songs || [];
        const updatedSongsImage = await convertSongsWithPresignedURL;
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
                    <Col key={index} md={4} lg={2} className="mb-3">
                      <div className="flip-card">
                        <div className="flip-card-inner">
                          <div className="flip-card-front">
                            <Card.Img
                              variant="top"
                              src={song.img_url}
                              alt={song.artist}
                            />
                          </div>
                          <div className="flip-card-back">
                            <Card.Body>
                              <Card.Title>{song.title}</Card.Title>
                              <Card.Text>
                                <strong>Artist:</strong> {song.artist} <br />
                                <strong>Album:</strong> {song.album} <br />
                                <strong>Year:</strong> {song.year}
                              </Card.Text>
                              <Button
                                variant="danger"
                                onClick={() => handleRemove(song.title)}
                              >
                                Unsubscribe
                              </Button>
                            </Card.Body>
                          </div>
                        </div>
                      </div>
                      <p style={{ marginTop: -20, fontSize: 16 }}>
                        {song.title}
                      </p>
                    </Col>
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
