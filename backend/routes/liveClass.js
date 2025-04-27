const express = require("express");
const auth = require("../middleware/auth");
const LiveClass = require("../models/LiveClass");

const router = express.Router();

// Get live classes where the user is the creator or invited
router.get("/mine", auth, async (req, res) => {
  try {
    const classes = await LiveClass.find({
      $or: [
        { creator: req.user.id }, // Created by user
        { allowedEmails: req.user.email }, // Invited by email
      ],
    });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new live class
router.post("/", auth, async (req, res) => {
  try {
    const { name, time, allowedEmails } = req.body;
    const newLiveclass = new LiveClass({
      name,
      time,
      creator: req.user.id,
      allowedEmails: allowedEmails || [], // Default to empty list
    });

    const savedLiveclass = await newLiveclass.save();
    res.json(savedLiveclass);
  } catch (error) {
    console.error("Error creating live class:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all live classes created by the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const liveClasses = await LiveClass.find({ creator: req.user.id });
    res.json(liveClasses);
  } catch (error) {
    console.error("Error fetching live classes:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Join a live class
router.post("/:id/join", auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if the user has already joined the class
    if (
      liveClass.participants.some(
        (participant) => participant.userId.toString() === req.user.id
      )
    ) {
      return res.status(400).json({ message: "User already joined" });
    }

    // Check if the user's email is allowed to join the class
    if (!liveClass.allowedEmails.includes(req.user.email)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to join this class" });
    }

    // Add the user to the participants array
    const { userId, username } = req.body;
    if (!userId || !username) {
      return res.status(400).json({ message: "UserId or username is missing" });
    }

    liveClass.participants.push({ userId, username });
    await liveClass.save();

    res.json(liveClass);
  } catch (error) {
    console.error("Error joining live class:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get a single live class by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }
    res.json(liveClass);
  } catch (error) {
    console.error("Error fetching live class:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Leave a live class
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Remove the user from the participants array
    liveClass.participants = liveClass.participants.filter(
      (participant) => participant.userId.toString() !== req.user.id
    );

    await liveClass.save();
    res.json(liveClass);
  } catch (error) {
    console.error("Error leaving live class:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE /api/liveclasses/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass || liveClass.creator.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: "Live class not found" });
    }
    await LiveClass.findByIdAndDelete(req.params.id);
    res.json({ message: "Live class deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
