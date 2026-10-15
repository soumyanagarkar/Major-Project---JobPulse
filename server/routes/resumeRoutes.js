const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadResume");

const {
  uploadResume,
  deleteResume,
  parseResume,
} = require("../controllers/resumeController");

router.put(
  "/",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.get(
  "/parse",
  authMiddleware,
  parseResume
);

router.delete(
  "/",
  authMiddleware,
  deleteResume
);

module.exports = router;