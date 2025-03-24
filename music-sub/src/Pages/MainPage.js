// MainPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  Carousel,
  Card,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      setCurrentUser(user);
      setSongs(user.songs);
    } else {
      // If no user is logged in, redirect to login.
      navigate("/login");
    }
  }, [navigate]);

  const handleRemove = (songTitle) => {
    const updatedSongs = songs.filter((song) => song.title !== songTitle);
    setSongs(updatedSongs);
    const updatedUser = { ...currentUser, songs: updatedSongs };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Also update the global users array.
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((u) => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem("users", JSON.stringify(users));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#f2f2f2", minHeight: "100vh" }}>
      {/*Custome CSS for the carousel */}
      <style>
        {`
          .carousel {
            position: relative;
            overflow: visible;
          }
          .carousel-item {
            text-align: center;
            overflow: visible;
          }
          
          .carousel-control-prev,
          .carousel-control-next {
            width: auto;
            top: 50%;
            transform: translateY(-50%);
          }
          .carousel-control-prev {
            left: 200px;
          }
          .carousel-control-next {
            right: 200px;
          }
          
          .carousel-indicators {
            bottom: -20px;
          }
          .carousel-indicators [data-bs-target] {
            background-color: #dc3545;
            opacity: 0.5;
          }
          .carousel-indicators .active {
            background-color: #ffc107; 
            opacity: 1;
          }
        `}
      </style>

      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>My Music App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {currentUser && (
                <Nav.Link disabled>Welcome, {currentUser.username}</Nav.Link>
              )}
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <h2>Your Songs</h2>
        {songs.length === 0 ? (
          <p>You have no songs subscribed yet.</p>
        ) : (
          <Carousel
            prevIcon={
              <span
                aria-hidden="true"
                className="carousel-control-prev-icon"
                style={{
                  filter: "invert(100%)",
                  width: "30px",
                  height: "30px",
                }}
              />
            }
            nextIcon={
              <span
                aria-hidden="true"
                className="carousel-control-next-icon"
                style={{
                  filter: "invert(100%)",
                  width: "30px",
                  height: "30px",
                }}
              />
            }
          >
            {songs.map((song, index) => (
              <Carousel.Item key={index}>
                <Card
                  className="text-center mx-auto"
                  style={{ maxWidth: "400px" }}
                >
                  <Card.Img
                    variant="top"
                    src={song.img_url}
                    alt={song.artist}
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                      margin: "auto",
                    }}
                  />
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
                      Remove Song
                    </Button>
                  </Card.Body>
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Container>
    </div>
  );
};

export default MainPage;
