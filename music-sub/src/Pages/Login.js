// LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {loginUser} from "../lambda-functions/musicAPI";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);

      // No need to check statusCode in data, just trust try/catch
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      navigate("/");

    } catch (err) {
      console.log(err.message);
      setError(err.message || "An error occurred during login. Please try again.");
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
                  <div className="d-grid search-container">
                    <Button variant="primary" type="submit" style={{backgroundColor: "#7c12ae", borderColor: "#7c12ae"}}>
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
