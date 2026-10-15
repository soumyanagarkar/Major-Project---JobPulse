const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  getDashboardJobs,
  getDashboardFilters,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/jobs", authMiddleware, getDashboardJobs);
router.get("/filters", authMiddleware, getDashboardFilters);

module.exports = router;