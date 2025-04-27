const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["teacher", "student"], default: "student" }, // New field for roles
  coursesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Courses created by the user (if they're a teacher)
  coursesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Courses the user is enrolled in (if they're a student)
  liveClassesCreated: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LiveClass" },
  ], // Live classes created by the user
  liveClassesEnrolled: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LiveClass" },
  ], // Live classes the user is enrolled in
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
