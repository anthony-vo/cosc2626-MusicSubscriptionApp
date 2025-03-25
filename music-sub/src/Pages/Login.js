// LoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import mockDB from "../mockDB.json";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Navbar,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Initialize localStorage "users" if not already set.
  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) {
      localStorage.setItem("users", JSON.stringify(mockDB.users));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/");
    } else {
      setError("Email or password is invalid");
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>My Music App</Navbar.Brand>
        </Container>
      </Navbar>
      <Container fluid className="bg-dark bg-gradient" style={{ minHeight: "100vh" }}>
        <Row
          className="justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <Col md={4}>
            <Card className="shadow">
              <Card.Body>
                <Card.Title className="text-center mb-4">Login</Card.Title>
                {error && <p className="text-danger text-center">{error}</p>}
                <Form onSubmit={handleLogin}>
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
                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button variant="primary" type="submit">
                      Login
                    </Button>
                  </div>
                </Form>
                <div className="mt-3 text-center">
                  <span>Don't have an account? </span>
                  <Link to="/register">Register here</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
