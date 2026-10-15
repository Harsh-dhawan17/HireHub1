const Job = require("../models/job.model");

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
    } = req.body;

    // Check required fields
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experienceLevel ||
      !position
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Create job
    const job = await Job.create({
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      company: req.user.userId,
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create job",
      error: error.message,
    });
  }
};
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate(
      "company",
      "fullname email"
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.status(200).json({
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check ownership
    if (job.company.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to update this job",
      });
    }

    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
    } = req.body;

    job.title = title ?? job.title;
    job.description = description ?? job.description;
    job.requirements = requirements ?? job.requirements;
    job.salary = salary ?? job.salary;
    job.location = location ?? job.location;
    job.jobType = jobType ?? job.jobType;
    job.experienceLevel = experienceLevel ?? job.experienceLevel;
    job.position = position ?? job.position;

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update job",
      error: error.message,
    });
  }
};
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check ownership
    if (job.company.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete job",
      error: error.message,
    });
  }
};
module.exports = {
  createJob,
  getAllJobs,
   getJobById,
   updateJob,
   deleteJob,
};