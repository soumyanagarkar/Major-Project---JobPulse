const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  searchJobs,
  getStoredJobs,
} = require("../controllers/jobController");


const router =
  express.Router();


/*
 * Fresh jobs from JobSpy
 */
router.get(
  "/search",
  authMiddleware,
  searchJobs
);


/*a
 * Jobs already stored in MongoDB
 */
router.get(
  "/",
  authMiddleware,
  getStoredJobs
);


module.exports =
  router;