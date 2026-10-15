const express = require("express");

const {
  applyForJob,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
} = require("../controllers/application.controller");

const isAuthenticated = require("../middlewares/isAuthenticated");
const isAuthorized = require("../middlewares/isAuthorized");

const router = express.Router();

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

router.post(
  "/apply/:jobId",
  isAuthenticated,
  isAuthorized("student"),
  upload.single("resumeFile"),
  applyForJob
);

router.get(
  "/my-applications",
  isAuthenticated,
  isAuthorized("student"),
  getMyApplications
);

router.get(
  "/recruiter",
  isAuthenticated,
  isAuthorized("recruiter"),
  getRecruiterApplications
);

router.put(
  "/:applicationId/status",
  isAuthenticated,
  isAuthorized("recruiter"),
  updateApplicationStatus
);

module.exports = router;