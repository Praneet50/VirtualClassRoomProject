import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function Courses() {
  const { user } = useContext(AuthContext); // Use AuthContext to get the logged-in user
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter the courses to only include those created by the logged-in user
        const userCourses = res.data.filter(
          (course) => course.creator === user.id
        );
        setCourses(userCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]); // Refetch courses when user data changes

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/courses",
        { name: courseName, description: courseDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If the course is created by the logged-in user, add it to the list
      if (res.data.creator === user.id) {
        setCourses([...courses, res.data]);
      }
      setCourseName("");
      setCourseDescription("");
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleAccessCourse = (id) => {
    navigate(`/course/${id}`); // Navigate to the dynamic course route
  };

  return (
    <Container className="mt-5">
      <h2>Your Courses</h2>

      {/* Create Course Form */}
      <Form onSubmit={handleCreateCourse} className="mb-4">
        <Form.Group controlId="courseName">
          <Form.Label>Course Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="courseDescription" className="mt-2">
          <Form.Label>Course Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter course description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" className="mt-3">
          Create Course
        </Button>
      </Form>

      {/* Display Courses */}
      <Row>
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
          <p>No courses available. Create one!</p>
        )}
      </Row>
    </Container>
  );
}

export default Courses;
  