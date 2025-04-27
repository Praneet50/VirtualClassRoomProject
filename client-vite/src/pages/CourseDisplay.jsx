import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  ListGroup,
} from "react-bootstrap";

function CourseDisplay() {
  const { id } = useParams();
  const [course, setCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Could not fetch course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Top Title */}
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="fw-bold">{course.name}</h1>
          <p className="text-muted">{course.description}</p>
        </Col>
      </Row>

      <Row>
        {/* Left Side: Content */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Course Content 📚</h4>
              <Card.Text style={{ whiteSpace: "pre-line", fontSize: "1.1rem" }}>
                {course.content}
              </Card.Text>
            </Card.Body>
          </Card>

          {/* Join Button */}
          <div className="text-center">
            <Button
              variant="success"
              size="lg"
              className="px-5"
              onClick={() => alert("Successfully Enrolled!")}
            >
              Join Course
            </Button>
          </div>
        </Col>

        {/* Right Side: Materials */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📂 Materials</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {course.materials && course.materials.length > 0 ? (
                course.materials.map((file, index) => (
                  <ListGroup.Item key={index}>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      📄 {file.filename}
                    </a>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No materials uploaded yet.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CourseDisplay;
