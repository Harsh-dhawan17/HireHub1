const Application = require("../models/application.model");
const Job = require("../models/job.model");
const { PDFParse } = require("pdf-parse");
const { matchResumeWithJob } = require("../services/ai.service");

/**
 * Helper to extract resume text from file buffer or text field
 */
async function extractResumeTextFromRequest(req) {
  if (req.file) {
    const mimetype = req.file.mimetype || "";
    const originalname = (req.file.originalname || "").toLowerCase();

    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const parsed = await parser.getText();
        await parser.destroy();
        if (parsed && parsed.text && parsed.text.trim()) {
          return parsed.text.trim();
        }
      } catch (err) {
        console.warn("PDF extraction warning during application:", err.message);
        const raw = req.file.buffer.toString("utf-8");
        const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
        if (clean.length > 30) return clean;
      }
    } else {
      return req.file.buffer.toString("utf-8").trim();
    }
  }

  return (req.body.resumeText || "").trim();
}

// ==========================================
// 1. STUDENT - APPLY FOR JOB
// ==========================================

const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check whether user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    const resumeText = await extractResumeTextFromRequest(req);
    const resumeFileName = req.file ? req.file.originalname : (req.body.resumeFileName || "");

    // Parse experience questions answered by candidate
    let experienceAnswers = [];
    if (req.body.experienceAnswers) {
      if (typeof req.body.experienceAnswers === "string") {
        try {
          experienceAnswers = JSON.parse(req.body.experienceAnswers);
        } catch (e) {
          experienceAnswers = [];
        }
      } else if (Array.isArray(req.body.experienceAnswers)) {
        experienceAnswers = req.body.experienceAnswers;
      }
    }

    const phone = req.body.phone || "";
    const coverNote = req.body.coverNote || "";

    // Automatically calculate ATS score if resume text was extracted
    let atsScore = typeof req.body.atsScore === "number" ? req.body.atsScore : 0;
    let matchDetails = req.body.matchDetails || null;

    if (!matchDetails && resumeText && resumeText.length > 20) {
      try {
        const evaluation = await matchResumeWithJob(resumeText, job);
        atsScore = evaluation.atsScore || 0;
        matchDetails = {
          matchedSkills: evaluation.matchedSkills || [],
          missingSkills: evaluation.missingSkills || [],
          strengths: evaluation.strengths || [],
          improvements: evaluation.improvements || [],
          summary: evaluation.summary || "",
        };
      } catch (e) {
        console.warn("ATS calculation warning during job apply:", e.message);
      }
    }

    if (!matchDetails) {
      matchDetails = {
        matchedSkills: [],
        missingSkills: [],
        strengths: [],
        improvements: [],
        summary: "",
      };
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user.userId,
      status: "pending",
      resumeFileName,
      resumeText,
      phone,
      coverNote,
      experienceAnswers,
      atsScore,
      matchDetails,
    });

    return res.status(201).json({
      message: "Job application submitted successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to apply for job",
      error: error.message,
    });
  }
};

// ==========================================
// 2. STUDENT - GET MY APPLICATIONS
// ==========================================

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.userId,
    })
      .populate(
        "job",
        "title description salary location jobType experienceLevel requirements company"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// ==========================================
// 3. RECRUITER - GET APPLICATIONS
// ==========================================

const getRecruiterApplications = async (req, res) => {
  try {
    // Find jobs created by this recruiter
    const jobs = await Job.find({
      company: req.user.userId,
    }).select("_id");

    const jobIds = jobs.map((job) => job._id);

    // Find applications for those jobs
    const applications = await Application.find({
      job: { $in: jobIds },
    })
      .populate("job", "title location salary requirements jobType experienceLevel")
      .populate("applicant", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// ==========================================
// 4. RECRUITER - UPDATE APPLICATION STATUS
// ==========================================

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    // Find application and related job
    const application = await Application.findById(
      applicationId
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Check whether recruiter owns the job
    if (
      application.job.company.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this application",
      });
    }

    // Update status
    application.status = status;

    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  applyForJob,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
};