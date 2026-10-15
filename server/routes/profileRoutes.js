const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
} = require("../controllers/profileController");
router.delete(
  "/photo",
  authMiddleware,
  removeProfilePhoto
);

router.get("/", authMiddleware, getProfile);

router.put("/", authMiddleware, updateProfile);

module.exports = router;