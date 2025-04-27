import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LiveClasses() {
  const { user } = useContext(AuthContext);
  const [liveClasses, setLiveClasses] = useState([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [allowedUsers, setAllowedUsers] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchLiveClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/liveclasses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Only filter if user exists and has an email
        const filteredLiveClasses = res.data.filter((liveClass) => {
          if (user && user.email && liveClass.allowedEmails) {
            return liveClass.allowedEmails.includes(user.email);
          }
          return true;
        });

        setLiveClasses(filteredLiveClasses.slice(0, 3));
      } catch (error) {
        console.error("Error fetching live classes:", error);
        setError("Error fetching live classes.");
      }
    };

    fetchLiveClasses();
  }, [user]);

  const handleCreateLiveClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const liveClassData = {
        name,
        time,
        allowedEmails: allowedUsers.split(",").map((email) => email.trim()), // 💥 Fix here
      };

      const res = await axios.post(
        "http://localhost:5000/api/liveclasses",
        liveClassData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new class and keep only first 3
      setLiveClasses((prev) => [...prev, res.data].slice(0, 3));
      setName("");
      setTime("");
      setAllowedUsers("");
    } catch (error) {
      console.error("Error creating live class:", error);
      setError("Error creating live class.");
    }
  };

  const handleJoinClass = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      const liveClass = liveClasses.find((c) => c._id === id);
      if (!liveClass) {
        setError("Class not found.");
        return;
      }

      // Check if the user is already joined to the class
      const isUserJoined = liveClass.participants?.some(
        (participant) => participant.userId === user._id
      );

      if (isUserJoined) {
        setError("You have already joined this class.");
        return;
      }

      // Check if the user is allowed to join
      if (
        liveClass.allowedEmails &&
        liveClass.allowedEmails.length > 0 &&
        !liveClass.allowedEmails.includes(user.email)
      ) {
        setError("You are not allowed to join this class.");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/liveclasses/${id}/join`,
        { userId: user._id, username: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Successful join: Redirect to the live class page
      navigate(`/liveclass/${id}`);
    } catch (error) {
      setError("Error joining the live class.");
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Live Classes</h2>

      {error && (
        <Alert variant={error.includes("not allowed") ? "danger" : "success"}>
          {error}
        </Alert>
      )}

      {/* Create Live Class Form */}
      <h3>My Live Classes</h3>
      <Form onSubmit={handleCreateLiveClass} className="mb-4">
        <Form.Group controlId="liveClassName">
          <Form.Label>Live Class Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter live class name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="liveClassTime" className="mt-2">
          <Form.Label>Class Time</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter time (e.g., 10:00 AM)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="allowedUsers" className="mt-2">
          <Form.Label>Allowed Users (comma-separated emails)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter allowed users' emails"
            value={allowedUsers}
            onChange={(e) => setAllowedUsers(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" className="mt-3">
          Create Live Class
        </Button>
      </Form>

      {/* Join Live Classes */}
      <h3 className="mt-4">Join Live Classes</h3>
      <Row>
        {liveClasses.length > 0 ? (
          liveClasses.map((liveClass) => (
            <Col key={liveClass._id} md={4} sm={6} xs={12} className="mb-3">
              <Card className="shadow-lg border-0">
                <Card.Body>
                  <Card.Title className="text-primary">
                    {liveClass.name}
                  </Card.Title>
                  <Card.Text>Time: {liveClass.time}</Card.Text>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleJoinClass(liveClass._id)}
                  >
                    Join Class
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No live classes available.</p>
        )}
      </Row>
    </Container>
  );
}

export default LiveClasses;
