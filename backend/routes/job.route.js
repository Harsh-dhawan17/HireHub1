const express = require("express");

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/job.controller");

const isAuthenticated = require("../middlewares/isAuthenticated");
const isAuthorized = require("../middlewares/isAuthorized");

const router = express.Router();

// Create job - recruiter only
router.post(
  "/create",
  isAuthenticated,
  isAuthorized("recruiter"),
  createJob
);

// Get all jobs - public
router.get("/", getAllJobs);

// Get single job - public
router.get("/:id", getJobById);

// Update job - recruiter only
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("recruiter"),
  updateJob
);

// Delete job - recruiter only
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("recruiter"),
  deleteJob
);

module.exports = router;