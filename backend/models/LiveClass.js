const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  allowedEmails: [String], // ✅ Only these emails can join
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
    },
  ],
});

const LiveClass = mongoose.model("LiveClass", liveClassSchema);
module.exports = LiveClass;
