// RegisterPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import mockDB from "../mockDB.json";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Navbar,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Initialize localStorage "users" if not already set.
  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) {
      localStorage.setItem("users", JSON.stringify(mockDB.users));
    }
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    // Check if the entered email already exists.
    const emailExists = users.some((u) => u.email === email);
    if (emailExists) {
      setError("The email already exists");
    } else {
      const newUser = {
        email,
        username,
        password,
        songs: [], // New user starts with no songs.
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      navigate("/login");
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>My Music App</Navbar.Brand>
        </Container>
      </Navbar>
      <Container fluid className="bg-light" style={{ minHeight: "100vh" }}>
        <Row
          className="justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <Col md={4}>
            <Card className="shadow">
              <Card.Body>
                <Card.Title className="text-center mb-4">Register</Card.Title>
                {error && <p className="text-danger text-center">{error}</p>}
                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button variant="primary" type="submit">
                      Register
                    </Button>
                  </div>
                </Form>
                <div className="mt-3 text-center">
                  <span>Already have an account? </span>
                  <Link to="/login">Login here</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Register;
