const express = require("express");
const auth = require("../middleware/auth");
const Quiz = require("../models/Quiz");

const router = express.Router();

// GET /api/quizzes/mine
router.get("/mine", auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      $or: [
        { creator: req.user.id }, // I created it
        { allowedUsers: req.user.email }, // or I’m invited
      ],
    });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a Quiz (Protected Route)
router.post("/", auth, async (req, res) => {
  try {
    const { name, topic, allowedUsers } = req.body;

    const newQuiz = new Quiz({
      name,
      topic,
      creator: req.user.id,
      allowedUsers: allowedUsers || [],
      questions: [],
    });

    const savedQuiz = await newQuiz.save();
    res.json(savedQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get All Quizzes for Logged-in User (Protected Route)
router.get("/", auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      $or: [{ creator: req.user.id }, { allowedUsers: req.user.email }],
    });
    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get a Specific Quiz by ID (Protected Route)
router.get("/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const isCreator = quiz.creator.toString() === req.user.id;
    const isAllowed = quiz.allowedUsers.includes(req.user.email);

    if (!isCreator && !isAllowed) {
      return res
        .status(403)
        .json({ message: "You don't have access to this quiz" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Add Question to Quiz (Protected Route)
router.post("/:id/add-question", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Only allow the creator to add questions
    if (quiz.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the quiz owner can add questions" });
    }

    const { text, options, correct } = req.body;

    quiz.questions.push({ text, options, correct });
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Submit quiz answers and calculate score
router.post("/:quizId/submit", async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // The answers the user submits

  try {
    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Calculate the score
    let score = 0;
    quiz.questions.forEach((question) => {
      if (answers[question._id] === question.correct) {
        score++;
      }
    });

    // Return the score
    res.json({ score });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/quizzes/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || quiz.creator.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
