const { PDFParse } = require("pdf-parse");
const Job = require("../models/job.model");
const { matchResumeWithJob, parseResumeText } = require("../services/ai.service");

/**
 * Controller to extract text from an uploaded file or body
 */
async function getResumeContent(req) {
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
      } catch (pdfErr) {
        console.warn("PDF extraction warning, attempting fallback text scan:", pdfErr.message);
        // Fallback: extract any printable strings from PDF buffer
        const raw = req.file.buffer.toString("utf-8");
        const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
        if (clean.length > 30) {
          return clean;
        }
      }
    } else {
      // Plain text or markdown
      return req.file.buffer.toString("utf-8").trim();
    }
  }

  return (req.body.resumeText || "").trim();
}

/**
 * Match a resume with a job posting
 */
const matchAts = async (req, res) => {
  try {
    const resumeText = await getResumeContent(req);

    if (!resumeText || resumeText.trim().length < 15) {
      return res.status(400).json({
        message: "Resume content is required (minimum 15 characters or valid PDF upload)",
      });
    }

    let jobData = null;
    const { jobId } = req.body;

    if (jobId) {
      const foundJob = await Job.findById(jobId);
      if (!foundJob) {
        return res.status(404).json({
          message: "Referenced job not found",
        });
      }
      jobData = foundJob;
    } else {
      jobData = {
        title: req.body.title || "Software Developer",
        description: req.body.description || "",
        requirements: Array.isArray(req.body.requirements)
          ? req.body.requirements
          : (req.body.requirements ? String(req.body.requirements).split(",").map(s => s.trim()) : []),
        jobType: req.body.jobType || "full-time",
        experienceLevel: req.body.experienceLevel || "fresher",
      };
    }

    const evaluation = await matchResumeWithJob(resumeText, jobData);

    return res.status(200).json({
      message: "ATS matching analysis generated successfully",
      evaluation,
      resumeExcerpt: resumeText.slice(0, 300) + (resumeText.length > 300 ? "..." : ""),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to evaluate ATS compatibility",
      error: error.message,
    });
  }
};

/**
 * Parse skills and metadata from a resume
 */
const parseResume = async (req, res) => {
  try {
    const resumeText = await getResumeContent(req);

    if (!resumeText || resumeText.trim().length < 15) {
      return res.status(400).json({
        message: "Resume text or document upload is required",
      });
    }

    const parsedData = await parseResumeText(resumeText);

    return res.status(200).json({
      message: "Resume parsed successfully",
      resumeText,
      parsed: parsedData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to parse resume",
      error: error.message,
    });
  }
};

module.exports = {
  matchAts,
  parseResume,
};
