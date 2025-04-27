// --- Your required imports ---
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const LiveClass = require("./models/LiveClass");
const User = require("./models/User");
require("dotenv").config();

// --- Server Setup ---
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://virtualclassroom-pi.vercel.app",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/upload", express.static("upload"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/course"));
app.use("/api/liveclasses", require("./routes/liveClass"));
app.use("/api/quizzes", require("./routes/quiz"));

// --- MongoDB Connect ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// --- Socket.io Logic ---
const connectedUsers = {}; // socketId => { classId, userId, isHost }
const hostSocketIds = {}; // classId => hostSocketId

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", async ({ classId, userId }) => {
    try {
      const liveClass = await LiveClass.findById(classId);
      if (!liveClass) {
        console.error("LiveClass not found:", classId);
        socket.emit("error", { message: "Live class not found." });
        return;
      }

      const isHost = String(liveClass.creator) === String(userId);

      socket.join(classId);
      connectedUsers[socket.id] = { classId, userId, isHost };

      socket.emit("role-assignment", { isHost });

      if (isHost) {
        hostSocketIds[classId] = socket.id;
        console.log(`Host registered for class ${classId}: ${socket.id}`);
      } else {
        const hostSocketId = hostSocketIds[classId];
        if (hostSocketId) {
          const user = await User.findById(userId);
          const username = user ? user.name : "Unknown User";
          // Tell the host that a new viewer joined
          io.to(hostSocketId).emit("user-joined", {
            socketId: socket.id,
            username,
          });
        }
      }

      console.log(
        `User ${userId} joined class ${classId} as ${
          isHost ? "Host" : "Viewer"
        }`
      );
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Server error during joining." });
    }
  });

  // WebRTC signaling
  socket.on("offer", ({ targetSocketId, offer }) => {
    console.log(`Offer from ${socket.id} to ${targetSocketId}`);
    io.to(targetSocketId).emit("offer", { senderSocketId: socket.id, offer });
  });

  socket.on("answer", ({ targetSocketId, answer }) => {
    console.log(`Answer from ${socket.id} to ${targetSocketId}`);
    io.to(targetSocketId).emit("answer", { senderSocketId: socket.id, answer });
  });

  socket.on("send-ice-candidate", ({ targetSocketId, candidate }) => {
    console.log(
      `ICE candidate from ${socket.id} to ${targetSocketId || "host"}`
    );
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-ice-candidate", {
        senderSocketId: socket.id,
        candidate,
      });
    } else {
      // Viewer sending ICE candidate to host
      const userData = connectedUsers[socket.id];
      if (userData) {
        const hostSocketId = hostSocketIds[userData.classId];
        if (hostSocketId) {
          io.to(hostSocketId).emit("receive-ice-candidate", {
            senderSocketId: socket.id,
            candidate,
          });
        }
      }
    }
  });

  socket.on("disconnect", () => {
    const userData = connectedUsers[socket.id];
    if (userData) {
      const { classId, isHost } = userData;
      if (isHost) {
        delete hostSocketIds[classId];
        console.log(`Host left class ${classId}`);
      }
      delete connectedUsers[socket.id];
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

// --- Basic API route ---
app.get("/", (_, res) => res.send("Virtual Classroom API running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, `0,0,0,0`, () =>
  console.log(
    `Server listening on https://virtualclassroomproject.onrender.com`
  )
);
