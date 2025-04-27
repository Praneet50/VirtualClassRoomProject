import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Button, ListGroup } from "react-bootstrap";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function MySection() {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Fetch user-specific data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch all Courses, filter by creator
        const courseRes = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userCourses = courseRes.data.filter(
          (course) => course.creator === user.id
        );
        setCourses(userCourses);

        // Fetch Live Classes, filter by creator
        const liveClassRes = await axios.get(
          "http://localhost:5000/api/liveclasses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userLiveClasses = liveClassRes.data.filter(
          (liveClass) => liveClass.creator === user.id
        );
        setLiveClasses(userLiveClasses);

        // Fetch Quizzes, filter by creator
        const quizRes = await axios.get("http://localhost:5000/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userQuizzes = quizRes.data.filter(
          (quiz) => quiz.creator === user.id
        );
        setQuizzes(userQuizzes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle deletion of course, live class, or quiz
  const handleDelete = async (type, id) => {
    try {
      const token = localStorage.getItem("token");

      // Delete request based on the type of item
      if (type === "course") {
        await axios.delete(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courses.filter((course) => course._id !== id));
      } else if (type === "liveClass") {
        await axios.delete(`http://localhost:5000/api/liveclasses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiveClasses(liveClasses.filter((liveClass) => liveClass._id !== id));
      } else if (type === "quiz") {
        await axios.delete(`http://localhost:5000/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(quizzes.filter((quiz) => quiz._id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">My Section (Create & Manage)</h2>

      {/* My Courses Section */}
      <Card className="p-3 mb-3">
        <h4>My Courses</h4>
        <p>Manage your created courses here.</p>
        {courses.length > 0 ? (
          <ListGroup>
            {courses.map((course) => (
              <ListGroup.Item key={course._id}>
                {course.name} - {course.description}
                <Button
                  variant="danger"
                  size="sm"
                  className="float-end"
                  onClick={() => handleDelete("course", course._id)}
                >
                  Delete
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No courses available. Create one!</p>
        )}
        <Link to="/courses">
          <Button variant="primary">Manage Courses</Button>
        </Link>
      </Card>

      {/* My Live Classes Section */}
      <Card className="p-3 mb-3">
        <h4>My Live Classes</h4>
        <p>Start and manage your live sessions.</p>
        {liveClasses.length > 0 ? (
          <ListGroup>
            {liveClasses.map((liveClass) => (
              <ListGroup.Item key={liveClass._id}>
                {liveClass.name} - {liveClass.time}
                <Button
                  variant="danger"
                  size="sm"
                  className="float-end"
                  onClick={() => handleDelete("liveClass", liveClass._id)}
                >
                  Delete
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No live classes available. Create one!</p>
        )}
        <Link to="/liveclasses">
          <Button variant="primary">Manage Live Classes</Button>
        </Link>
      </Card>

      {/* My Quizzes Section */}
      <Card className="p-3 mb-3">
        <h4>My Quizzes</h4>
        <p>Create and manage quizzes for students.</p>
        {quizzes.length > 0 ? (
          <ListGroup>
            {quizzes.map((quiz) => (
              <ListGroup.Item key={quiz._id}>
                {quiz.name} - Topics: {quiz.topic}
                <Button
                  variant="danger"
                  size="sm"
                  className="float-end"
                  onClick={() => handleDelete("quiz", quiz._id)}
                >
                  Delete
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No quizzes available. Create one!</p>
        )}
        <Link to="/quizzes">
          <Button variant="primary">Manage Quizzes</Button>
        </Link>
      </Card>
    </Container>
  );
}

export default MySection;
