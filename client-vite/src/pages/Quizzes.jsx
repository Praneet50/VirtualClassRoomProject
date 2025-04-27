import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function Quizzes() {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [allowedUsers, setAllowedUsers] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (!user) return;
        const token = localStorage.getItem("token");
        const res = await axios.get("https://virtualclassroomproject.onrender.com/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredQuizzes = res.data.filter(
          (quiz) =>
            quiz.creator === user.id ||
            (quiz.allowedUsers && quiz.allowedUsers.includes(user.email))
        );

        setQuizzes(filteredQuizzes.slice(0, 3));
      } catch (error) {
        setError("Error fetching quizzes.");
      }
    };

    fetchQuizzes();
  }, [user]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://virtualclassroomproject.onrender.com/api/quizzes",
        {
          name: quizName,
          topic: quizTopic,
          allowedUsers: allowedUsers.split(",").map((email) => email.trim()),
          questions: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuizzes((prevQuizzes) => [...prevQuizzes, res.data].slice(0, 3));
      setQuizName("");
      setQuizTopic("");
      setAllowedUsers("");
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <h2>My Quizzes</h2>

      {/* Create Quiz Form */}
      <Form onSubmit={handleCreateQuiz} className="mb-4">
        <Form.Group controlId="quizName">
          <Form.Label>Quiz Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter quiz name"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="quizTopic" className="mt-2">
          <Form.Label>Topic</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter quiz topic"
            value={quizTopic}
            onChange={(e) => setQuizTopic(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="allowedUsers" className="mt-2">
          <Form.Label>Allowed Users (comma-separated emails)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter emails (e.g., user1@example.com, user2@example.com)"
            value={allowedUsers}
            onChange={(e) => setAllowedUsers(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" className="mt-3">
          Create Quiz
        </Button>
      </Form>

      {/* Display Quizzes */}
      <Row>
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Col key={quiz._id} md={4} sm={6} xs={12} className="mb-3">
              <Card className="shadow-lg border-0">
                <Card.Body>
                  <Card.Title className="text-success">{quiz.name}</Card.Title>
                  <Card.Text>Topic: {quiz.topic}</Card.Text>
                  <Link to={`/quiz/${quiz._id}/edit`}>
                    <Button variant="outline-success" size="sm">
                      Edit Quiz
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No quizzes available.</p>
        )}
      </Row>
    </Container>
  );
}

export default Quizzes;
