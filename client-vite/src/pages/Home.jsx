import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Carousel,
} from "react-bootstrap";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Fetch user data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch Courses (only for the logged-in user)
        const courseRes = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter courses to only show those created by the logged-in user
        const userCourses = courseRes.data.filter(
          (course) => course.creator === user.id
        );
        setCourses(userCourses.slice(0, 3)); // Limit to first 3 courses

        // Fetch Live Classes
        const liveClassRes = await axios.get(
          "http://localhost:5000/api/liveclasses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLiveClasses(liveClassRes.data.slice(0, 3)); // Limit to first 3 live classes

        // Fetch Quizzes
        const quizRes = await axios.get("http://localhost:5000/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(quizRes.data.slice(0, 3)); // Limit to first 3 quizzes
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAccessCourse = (id) => {
    navigate(`/course/${id}`); // Navigate to the dynamic route
  };

  return (
    <Container className="mt-5">
      {user ? (
        <>
          {/* Courses Section */}
          <h2 className="mt-4">Your Courses</h2>
          <Row className="mt-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Col key={course._id} md={4} sm={6} xs={12} className="mb-3">
                  <Card className="shadow-lg border-0">
                    <Card.Body>
                      <Card.Title className="text-primary">
                        {course.name}
                      </Card.Title>
                      <Card.Text>{course.description}</Card.Text>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleAccessCourse(course._id)}
                      >
                        Access Course
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No courses available. Create a new one!</p>
            )}
          </Row>
          <div className="text-start">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/courses")}
            >
              Manage Courses
            </Button>
          </div>

          {/* Live Classes Section */}
          <h2 className="mt-4">Upcoming Live Classes</h2>
          {liveClasses.length > 0 ? (
            <ListGroup className="mt-3 mb-3">
              {liveClasses.map((liveClass) => (
                <ListGroup.Item
                  key={liveClass._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  {liveClass.name} - {liveClass.time}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => navigate(`/liveclass/${liveClass._id}`)}
                  >
                    Join
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No live classes available.</p>
          )}
          <div className="text-start">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/liveclasses")}
            >
              Manage Live Classes
            </Button>
          </div>

          {/* Quizzes Section */}
          <h2 className="mt-4">Available Quizzes</h2>
          {quizzes.length > 0 ? (
            <ListGroup className="mt-3 mb-3">
              {quizzes.map((quiz) => (
                <ListGroup.Item
                  key={quiz._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  {quiz.name} - Topics: {quiz.topic}
                  <Link to={`/quiz/${quiz._id}`}>
                    <Button variant="warning" size="sm">
                      Start Quiz
                    </Button>
                  </Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No quizzes available.</p>
          )}
          <div className="text-start">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/quizzes")}
            >
              Manage Quizzes
            </Button>
          </div>

          {/* Logout Button */}
          <div className="text-center mt-4">
            <Button variant="danger" size="lg" onClick={logout}>
              Logout
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Hero Carousel */}
          <Carousel fade className="shadow-lg rounded" interval={3000}>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/images/freetouse.png"
                alt="Free to Use"
                height={600}
                width={840}
              />
              <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3">
                <h3>Free to Use</h3>
                <p>
                  Our virtual classroom is completely free for students and
                  educators.
                </p>
              </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/images/easytouse.png"
                alt="Easy to Use"
                height={600}
                width={840}
              />
              <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3">
                <h3>Easy to Use</h3>
                <p>
                  Simple and intuitive interface for a smooth learning
                  experience.
                </p>
              </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/images/livevideoclass.png"
                alt="Live Video Classes"
                height={600}
                width={840}
              />
              <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3">
                <h3>Live Video Classes</h3>
                <p>
                  Attend interactive live classes with real-time discussions.
                </p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
          {/* Features Section */}
          <Row className="mt-5">
            <Col md={4}>
              <Card className="text-center shadow-lg p-3">
                <i className="bi bi-person-check-fill text-primary display-4"></i>
                <Card.Body>
                  <Card.Title>Secure Login</Card.Title>
                  <Card.Text>
                    Register and log in securely to access your courses.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center shadow-lg p-3">
                <i className="bi bi-camera-video-fill text-success display-4"></i>
                <Card.Body>
                  <Card.Title>Live Classes</Card.Title>
                  <Card.Text>
                    Join live video sessions with teachers and classmates.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center shadow-lg p-3">
                <i className="bi bi-file-earmark-text-fill text-warning display-4"></i>
                <Card.Body>
                  <Card.Title>Assignments & Quizzes</Card.Title>
                  <Card.Text>
                    Test your knowledge with interactive quizzes and
                    assignments.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default Home;
