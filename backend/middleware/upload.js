const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Destination reached"); // Debugging log
    cb(null, path.join(__dirname, "../upload")); // Use absolute path
  },
  filename: (req, file, cb) => {
    console.log("Filename:", file.originalname); // Debugging log
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
