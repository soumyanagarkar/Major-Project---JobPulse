const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const uploadProfilePhoto = require("../middleware/profilePhotoUpload");

const {
  uploadProfilePhoto: uploadPhoto,
} = require("../controllers/profilePhotoController");

router.post(
  "/upload",
  authMiddleware,
  uploadProfilePhoto.single("photo"),
  uploadPhoto
);

module.exports = router;