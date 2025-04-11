import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
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
import { generatePresignedURL, searchSongs } from "../api/musicAPI";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";


const MainPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState({
    title: "",
    artist: "",
    year: "",
    album: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subsLoading, setSubsLoading] = useState(true);

  const BASE_API_URL =
      "https://04456aftih.execute-api.us-east-1.amazonaws.com/fetch/fetch";

  const user1 = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    if (!user1 || !user1.email) {
      setSubsLoading(false);
      return;
    }

    const userEmail = user1.email;
    setSubsLoading(true);

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
        .finally(() => {
          setSubsLoading(false);
        });
  }, [navigate]);


  const handleRemove = (songTitle, songAlbum) => {
    if (!currentUser || !currentUser.email) {
      console.error("No current user available. Cannot remove song.");
      return;
    }
    axios
      .post(BASE_API_URL, {
        type: "removeSong",
        id: currentUser.email,
        body: JSON.stringify({ title: songTitle, album: songAlbum }),
      })
      .then(async (res) => {
        const parsedBody = JSON.parse(res.data.body);
        const updatedUser = parsedBody.user;
        const updatedSubscription = updatedUser.songs || [];
        const updatedSongsImage = await generatePresignedURL(
          updatedSubscription
        );
        setCurrentUser(updatedUser);
        setSongs(updatedSongsImage);
      })
      .catch((err) => console.error("Error removing: ", err));
  };

  const handleSearch = async () => {
    if (!query.title && !query.artist && !query.year && !query.album) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchSongs(
        query.title,
        query.artist,
        query.year,
        query.album
      );
      const updatedSongsImage = await generatePresignedURL(results);
      setSearchResults(updatedSongsImage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (song) => {
    try {
      const res = await axios.post(BASE_API_URL, {
        type: "addSong",
        id: currentUser.email,
        body: JSON.stringify({ song }),
      });
      // Parse the body
      const parsedBody = JSON.parse(res.data.body);
      const updatedUser = parsedBody.user;
      const updatedSubscription = updatedUser.songs || [];
      const updatedSongsImage = await generatePresignedURL(updatedSubscription);
      setCurrentUser(updatedUser);
      setSongs(updatedSongsImage);
    } catch (err) {
      console.error("Error subscribing: ", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleScroll = (direction) => {
    const container = document.querySelector(".search-results-container");
    const scrollAmount = 1150;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else if (direction === "right") {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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
              <Navbar.Toggle aria-controls="basic-navbar-nav"/>
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                  {currentUser ? (
                      <>
                        <Nav.Link disabled style={{color: "white"}}>
                          <FaUser style={{marginRight: "8px"}}/>
                          Welcome, {currentUser.user_name}
                        </Nav.Link>
                        <Nav.Link
                            onClick={handleLogout}
                            style={{color: "#9e19dc", fontWeight: "bold"}}
                        >
                          Logout
                        </Nav.Link>
                      </>
                  ) : (
                      <Nav.Link
                          onClick={() => navigate("/login")}
                          style={{color: "#9e19dc", fontWeight: "bold"}}
                      >
                        Login
                      </Nav.Link>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          <div style={{flex: 1}}>
            <Container className="Search-Songs">
              <form
                  className="search-container"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
              >
                <h2>Search</h2>
                <input
                    type="text"
                    placeholder="Title"
                    onChange={(e) => setQuery({...query, title: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Artist"
                    onChange={(e) => setQuery({...query, artist: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Year"
                    onChange={(e) => setQuery({...query, year: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Album"
                    onChange={(e) => setQuery({...query, album: e.target.value})}
                />
                <button type="submit">Search</button>
              </form>

              {loading ? (
                  <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                    <Spinner animation="border" role="status" style={{color: "#9e19dc"}}>
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
              ) : searchResults.length > 0 ? (
                  <>
                    <div
                        className="scroll-container"
                        style={{position: "relative"}}
                    >
                      <div
                          className="scroll-buttons-container"
                          style={{
                            marginTop: 30,
                            marginBottom: -15,
                            right: "0",
                            transform: "translateY(-50%)",
                            zIndex: 2,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                      >
                        <p style={{margin: 0, alignSelf: "center"}}>
                          {searchResults.length} results found
                        </p>
                        <div style={{display: "flex", gap: "7px"}}>
                          <button
                              className="scroll-button left"
                              onClick={() => handleScroll("left")}
                          >
                            &lt;
                          </button>
                          <button
                              className="scroll-button right"
                              onClick={() => handleScroll("right")}
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                        className="search-results-container"
                        style={{
                          display: "flex",
                          overflowX: "scroll",
                          overflowY: "hidden",
                          gap: "15px",
                          padding: "10px 0",
                          scrollSnapType: "x mandatory",
                          scrollBehavior: "smooth",
                          flex: 1,
                        }}
                    >
                      {searchResults.map((song, index) => (
                          <div
                              key={index}
                              style={{
                                flexShrink: 0,
                                width: "250px",
                                scrollSnapAlign: "center",
                              }}
                          >
                            <div className="morph-card">
                              <Card.Img
                                  variant="top"
                                  src={song.img_url}
                                  alt={song.artist}
                                  className="card-img"
                              />
                              <div className="morph-overlay">
                                <div className="card-back-content">
                                  <h5 style={{color: "purple"}}>{song.title}</h5>
                                  <p>
                                    <strong>Artist:</strong> {song.artist}
                                    <br/>
                                    <strong>Album:</strong> {song.album}
                                    <br/>
                                    <strong>Year:</strong> {song.year}
                                  </p>
                                  {currentUser && (
                                      <Button
                                          className={
                                            songs.some((s) => s.title === song.title)
                                                ? "btn-danger"
                                                : "btn-purple"
                                          }
                                          onClick={() =>
                                              songs.some((s) => s.title === song.title)
                                                  ? handleRemove(song.title, song.album)
                                                  : handleSubscribe(song)
                                          }
                                      >
                                        {songs.some((s) => s.title === song.title)
                                            ? "Unsubscribe"
                                            : "Subscribe"}
                                      </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p
                                style={{marginTop: 5, marginBottom: 0, fontSize: 16}}
                            >
                              {song.title}
                            </p>
                          </div>
                      ))}
                    </div>
                  </>
              ) : (
                  <p style={{marginTop: "30px"}}>No results retrieved.</p>
              )}
            </Container>

          {(
              <Container className="recent-subs">
                <h2>Your Recent Subscriptions</h2>
                {subsLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status" style={{ color: "#9e19dc" }} />
                      <h4 className="mt-3">Loading your subscriptions...</h4>
                    </div>
                ) : !currentUser ? (
                    <p>
                      Let's{" "}
                      <Link to="/login" style={{ color: "#9e19dc", textDecoration: "underline" }}>
                        login
                      </Link>{" "}
                      or{" "}
                      <Link to="/register" style={{ color: "#9e19dc", textDecoration: "underline" }}>
                        register
                      </Link>{" "}
                      to view your recent subscription list.
                    </p>
                ) : songs.length === 0 ? (
                    <p>You don't have any subscriptions yet!</p>
                ) : (
                    <Row>
                      {songs
                          .slice(-6)
                          .reverse()
                          .map((song, index) => (
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
                                        <strong>Artist:</strong> {song.artist}
                                        <br />
                                        <strong>Album:</strong> {song.album}
                                        <br />
                                        <strong>Year:</strong> {song.year}
                                      </p>
                                      <Button
                                          variant="danger"
                                          onClick={() => handleRemove(song.title, song.album)}
                                          style={{ marginTop: "auto" }}
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
          )}
        </div>
      </div>
    </div>
</div>
)
  ;
};

export default MainPage;
