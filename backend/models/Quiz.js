const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  allowedUsers: {
    type: [String], // Store emails of allowed users
    default: [],
  },
  questions: [
    {
      text: { type: String, required: true }, // Question text
      options: [{ type: String, required: true }], // Multiple choice options
      correct: { type: String, required: true }, // Correct answer
    },
  ],
});

module.exports = mongoose.model("Quiz", quizSchema);
