import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

function QuizAttempt() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://virtualclassroomproject.onrender.com/api/quizzes/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuiz(res.data);
      } catch (error) {
        setError("Error fetching quiz.");
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedAnswer,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://virtualclassroomproject.onrender.com/api/quizzes/${id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Your score is: ${response.data.score}`);
    } catch (error) {
      setError("Error submitting answers.");
    }
  };

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}

      {quiz && (
        <>
          <h2>{quiz.name}</h2>
          <p>Topic: {quiz.topic}</p>

          {quiz.questions.map((question) => (
            <Card key={question._id} className="p-3 mb-3">
              <h4>{question.text}</h4>
              {question.options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  label={option}
                  name={question._id}
                  value={option}
                  checked={answers[question._id] === option}
                  onChange={() => handleAnswerChange(question._id, option)}
                />
              ))}
            </Card>
          ))}

          <Button onClick={handleSubmit} className="mt-3">
            Submit Quiz
          </Button>
        </>
      )}
    </Container>
  );
}

export default QuizAttempt;
