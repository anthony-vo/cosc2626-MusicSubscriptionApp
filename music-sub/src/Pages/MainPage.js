import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  Card,
  Button,
  Row,
  Col
} from "react-bootstrap";
import { FaUser } from 'react-icons/fa';
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../Components/Sidebar";
import {generatePresignedURL, searchSongs} from "../api/musicAPI";
import axios from "axios";

const MainPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState({ title: "", artist: "", year: "", album: "" });
  const [searchResults, setSearchResults] = useState([]);

  const BASE_API_URL =
      "https://xtb9qbsb71.execute-api.us-east-1.amazonaws.com/Production/fetch";

  const userEmail = "s39224062@student.rmit.edu.au";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
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
    if (user) {
      setCurrentUser(user);
    } else {
      navigate("/login");
    }
  }, [navigate, userEmail]);


  const handleRemove = (songTitle) => {
    const updatedSongs = songs.filter((song) => song.title !== songTitle);
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

  const handleSearch = async () => {
    if (!query.title && !query.artist && !query.year && !query.album) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchSongs(query.title, query.artist, query.year, query.album);
      const updatedSongsImage = await generatePresignedURL(results);
      setSearchResults(updatedSongsImage)
    } catch (error) {
      console.error("Search failed:", error.message);
    }
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

  const handleScroll = (direction) => {
    const container = document.querySelector('.search-results-container');
    const scrollAmount = 1150;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
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

            <div style={{ flex: 1 }}>
            <Container className="Search-Songs">
              <div className="search-container">
                <h2>Search</h2>
                <input
                    type="text"
                    placeholder="Title"
                    onChange={(e) => setQuery({ ...query, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Artist"
                    onChange={(e) => setQuery({ ...query, artist: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Year"
                    onChange={(e) => setQuery({ ...query, year: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Album"
                    onChange={(e) => setQuery({ ...query, album: e.target.value })}
                />
                <button onClick={handleSearch}>Search</button>
              </div>

              {searchResults.length > 0 && (
                  <div className="scroll-container" style={{ position: 'relative' }}>
                    <div className="scroll-buttons-container" style={{
                      marginTop: 30,
                      marginBottom: -15,
                      right: '0',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <p style={{ margin: 0, alignSelf: 'center' }}>{searchResults.length} results found</p>
                      <div style={{ display: 'flex', gap: '7px' }}>
                        <button className="scroll-button left" onClick={() => handleScroll('left')}>
                          &lt;
                        </button>
                        <button className="scroll-button right" onClick={() => handleScroll('right')}>
                          &gt;
                        </button>
                      </div>
                    </div>
                  </div>
              )}

              {searchResults.length > 0 ? (
                  <div className="search-results-container" style={{
                    display: 'flex',
                    overflowX: 'scroll',
                    overflowY: 'hidden',
                    gap: '15px',
                    padding: '10px 0',
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth',
                    flex: 1
                  }}>
                    {searchResults.map((song, index) => (
                        <div key={index} style={{
                          flexShrink: 0,
                          width: '250px',
                          scrollSnapAlign: 'center',
                        }}>
                          <div className="morph-card">
                            <Card.Img variant="top" src={song.img_url} alt={song.artist} className="card-img" />
                            <div className="morph-overlay">
                              <div className="card-back-content">
                                <h5 style={{color: "purple"}}>{song.title}</h5>
                                <p>
                                  <strong>Artist:</strong> {song.artist}<br />
                                  <strong>Album:</strong> {song.album}<br />
                                  <strong>Year:</strong> {song.year}
                                </p>
                                <Button
                                    className={songs.some((s) => s.title === song.title) ? "btn-danger" : "btn-purple"}
                                    onClick={() =>
                                        songs.some((s) => s.title === song.title)
                                            ? handleRemove(song.title)
                                            : handleSubscribe(song)
                                    }
                                >
                                  {songs.some((s) => s.title === song.title) ? "Unsubscribe" : "Subscribe"}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p style={{ marginTop: 5, marginBottom: 0, fontSize: 16 }}>{song.title}</p>
                        </div>
                    ))}
                  </div>
              ) : (
                  <p style={{ marginTop: '30px' }}>No results retrieved.</p>
              )}
            </Container>

            {/* Displaying user's subscriptions */}
            <Container className="recent-subs">
              <h2>Your Recent Subscriptions</h2>
              {songs.length === 0 ? (
                  <p>You don't have any subscriptions yet!</p>
              ) : (
                  <Row>
                    {songs.slice(-6).reverse().map((song, index) => (
                        <Col key={index} md={4} lg={2} className="mb-3">
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
                                  <strong>Artist:</strong> {song.artist}<br />
                                  <strong>Album:</strong> {song.album}<br />
                                  <strong>Year:</strong> {song.year}
                                </p>
                                <Button
                                    variant="danger"
                                    onClick={() => handleRemove(song.title)}
                                    style={{ marginTop: 'auto' }}
                                >
                                  Unsubscribe
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p style={{ marginTop: 5, fontSize: 16 }}>{song.title}</p>
                        </Col>
                    ))}
                  </Row>
              )}
            </Container>
          </div>
        </div>
        </div>
      </div>
  );
};

export default MainPage;
