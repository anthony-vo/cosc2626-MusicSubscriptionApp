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
  Row,
  Col
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import mockDB from "../2025a1.json";

const MainPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState({ title: "", artist: "", year: "", album: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;


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

  const handleSearch = () => {
    const filteredSongs = mockDB.songs.filter((song) => {
        return (
            (!query.title || song.title.toLowerCase().includes(query.title.toLowerCase())) &&
            (!query.artist || song.artist.toLowerCase().includes(query.artist.toLowerCase())) &&
            (!query.year || song.year === query.year) &&
            (!query.album || song.album.toLowerCase().includes(query.album.toLowerCase()))
        );
    });
    setSearchResults(filteredSongs);
  };

  const handleSubscribe = async (song) => {
    const updatedSongs = [...songs, song];
    setSongs(updatedSongs);
    const updatedUser = { ...currentUser, songs: updatedSongs };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

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

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(searchResults.length / resultsPerPage);

  return (
    <div style={{ minHeight: "100vh" }} className="bg-dark bg-gradient">
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
      <Container className = "mt-4">
          <h2>Search Songs</h2>
          <input type="text" placeholder="Title" onChange={(e) => setQuery({ ...query, title: e.target.value })} />
          <input type="text" placeholder="Artist" onChange={(e) => setQuery({ ...query, artist: e.target.value })} />
          <input type="text" placeholder="Year" onChange={(e) => setQuery({ ...query, year: e.target.value })} />
          <input type="text" placeholder="Album" onChange={(e) => setQuery({ ...query, album: e.target.value })} />
          <button onClick={handleSearch}>Search</button>

          {searchResults.length > 0 ? (
              <div>
                  <Row>
                      {currentResults.map((song, index) => (
                          <Col key={index} md={4} lg={2} className="mb-3">
                              <Card>
                                  <Card.Img variant="top" src={song.img_url} alt={song.artist} />
                                  <Card.Body>
                                      <Card.Title>{song.title}</Card.Title>
                                      <Card.Text>
                                          <strong>Artist:</strong> {song.artist} <br />
                                          <strong>Album:</strong> {song.album} <br />
                                          <strong>Year:</strong> {song.year}
                                      </Card.Text>
                                      <Button variant="primary" onClick={() => handleSubscribe(song)}>
                                          Subscribe
                                      </Button>
                                  </Card.Body>
                              </Card>
                          </Col>
                      ))}
                  </Row>
                  <div className="d-flex justify-content-between">
                      <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                          Previous
                      </Button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                          Next
                      </Button>
                  </div>
              </div>
          ) : (
              <p>No result is retrieved. Please query again</p>
              )}
      </Container>
    </div>
  );
};

export default MainPage;
