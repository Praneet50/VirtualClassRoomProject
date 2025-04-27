import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

function QuizEditor() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [answerOptions, setAnswerOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(res.data);
      } catch (error) {
        setError("Error fetching quiz details.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAddQuestion = async () => {
    // Validation for question fields
    if (!questionText || answerOptions.some((opt) => !opt) || !correctAnswer) {
      setError("Please fill in all fields and ensure the correct answer is one of the options.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const newQuestion = {
        text: questionText,
        options: answerOptions,
        correct: correctAnswer,
      };

      const res = await axios.post(
        `http://localhost:5000/api/quizzes/${id}/add-question`,
        newQuestion,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuiz(res.data);
      setQuestionText("");
      setAnswerOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setError(""); // Clear error if any
    } catch (error) {
      setError("Error adding question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      {loading && <Spinner animation="border" variant="primary" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {quiz && (
        <>
          <h2>{quiz.name}</h2>
          <p>Topic: {quiz.topic}</p>

          {/* Question Form */}
          <Card className="p-3 mb-3">
            <h4>Add Question</h4>
            <Form.Group>
              <Form.Label>Question</Form.Label>
              <Form.Control
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Label>Options</Form.Label>
            {answerOptions.map((option, index) => (
              <Form.Control
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...answerOptions];
                  updatedOptions[index] = e.target.value;
                  setAnswerOptions(updatedOptions);
                }}
                className="mb-2"
              />
            ))}

            <Form.Group>
              <Form.Label>Correct Answer</Form.Label>
              <Form.Control
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />
            </Form.Group>

            <Button onClick={handleAddQuestion} className="mt-3" disabled={loading}>
              {loading ? "Adding..." : "Add Question"}
            </Button>
          </Card>
        </>
      )}
    </Container>
  );
}

export default QuizEditor;
