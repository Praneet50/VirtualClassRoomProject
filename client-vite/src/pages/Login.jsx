import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To store validation errors
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setErrorMessage("Both email and password are required!");
      return; // Stop form submission if validation fails
    }

    try {
      await login(email, password);
      navigate("/"); // Redirect to home after successful login
    } catch (error) {
      // You can handle any login errors here (e.g., wrong credentials)
      setErrorMessage("Invalid credentials, please try again.");
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center"
      style={{ marginTop: "20rem" }}
    >
      <Card
        className="p-4 shadow-lg"
        style={{ width: "400px", borderRadius: "20px" }}
      >
        <h2 className="mb-4 text-center">Login</h2>

        {/* Show error message if there is one */}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 mt-2">
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default Login;
