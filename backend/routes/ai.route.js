const express = require("express");
const multer = require("multer");
const { matchAts, parseResume } = require("../controllers/ai.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

// Memory storage for PDF uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Match resume against a job
router.post("/match", upload.single("resumeFile"), matchAts);

// Parse standalone resume
router.post("/parse", upload.single("resumeFile"), parseResume);

module.exports = router;
