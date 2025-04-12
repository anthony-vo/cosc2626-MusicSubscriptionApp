// RegisterPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { registerUser } from "../lambda-functions/musicAPI.js";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const data = await registerUser(email, username, password);
      console.log(data);
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>My Music App</Navbar.Brand>
        </Container>
      </Navbar>
      <Container fluid className="text-white" style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.9), rgba(0, 0, 0, 1))"
      }}>
        <Row
          className="justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <Col md={4}>
            <Card className="bg-dark text-white">
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
                      id = "password"
                    />
                  </Form.Group>
                  <div className="d-grid search-container">
                    <Button variant="primary" type="submit" style={{backgroundColor: "#7c12ae", borderColor: "#7c12ae"}}>
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
