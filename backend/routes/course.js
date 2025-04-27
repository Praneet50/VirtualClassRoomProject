const express = require("express");
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/mine", auth, async (req, res) => {
  try {
    const myCourses = await Course.find({
      $or: [
        { creator: req.user.id }, // I created
        { students: req.user.id }, // I enrolled
      ],
    });
    res.json(myCourses);
  } catch (err) {
    console.error("Error fetching my courses:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Create Course (Protected Route)
router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body; // No allowedUsers, just name and description

    // Create new course without allowedUsers
    const newCourse = new Course({
      name,
      description,
      creator: req.user.id,
      students: [], // Initialize students array as empty
    });

    const savedCourse = await newCourse.save();
    res.json(savedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all courses (public and private, no permission check)
router.get("/", auth, async (req, res) => {
  try {
    // Fetch all courses
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get a single course by ID (Protected Route)
router.get("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Ensure the user is either the creator or enrolled in the course
    if (
      course.creator.toString() !== req.user.id &&
      !course.students.includes(req.user.id)
    ) {
      return res
        .status(403)
        .json({ message: "You don't have access to this course" });
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update a course (Protected Route)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, content } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Ensure only the creator can update the course
    if (course.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the course creator can update it" });
    }

    // Update the course details
    course.name = name || course.name;
    course.description = description || course.description;
    course.content = content || course.content;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Upload file to course (Protected Route)
router.post("/:id/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add the file to the course materials
    course.materials.push({
      filename: req.file.originalname,
      fileUrl: `http://localhost:5000/upload/${req.file.filename}`,
    });

    await course.save();

    res.json(course);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Enroll in a course (Protected Route)
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add user to the students list without checking for allowedUsers
    if (!course.students.includes(req.user.id)) {
      course.students.push(req.user.id);
      await course.save();
    }

    res.json({ message: "Successfully enrolled in the course", course });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all public courses (for browsing)
router.get("/all", auth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching public courses:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE /api/courses/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.creator.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: "Course not found" });
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
