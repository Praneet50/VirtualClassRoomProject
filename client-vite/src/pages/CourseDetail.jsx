import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Card } from "react-bootstrap";

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://virtualclassroomproject.onrender.com/api/courses/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourse(res.data);
        setName(res.data.name);
        setDescription(res.data.description);
        setContent(res.data.content);
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://virtualclassroomproject.onrender.com/api/courses/${id}`,
        { name, description, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(res.data);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://virtualclassroomproject.onrender.com/api/courses/${id}/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourse(res.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Container>
      <h1>Edit Course</h1>
      <Form onSubmit={handleUpdate}>
        <Form.Group>
          <Form.Label>Course Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="mt-3">
          Update Course
        </Button>
      </Form>

      {/* File Upload */}
      <Form onSubmit={handleUpload} className="mt-4">
        <Form.Group>
          <Form.Label>Upload Material</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Form.Group>

        <Button type="submit" className="mt-3">
          Upload File
        </Button>
      </Form>

      <h3 className="mt-4">Uploaded Files</h3>
      {course.materials?.map((file) => (
        <Card key={file.filename} className="mb-2">
          <Card.Body>
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
              {file.filename}
            </a>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default CourseDetail;
