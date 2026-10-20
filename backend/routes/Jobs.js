
const express = require("express");
const Job = require("../models/Job");
const { protect, employerOnly } = require("../middleware/auth");

const router = express.Router();

// Get all jobs (public)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;

    const jobs = await Job.find(filter)
      .populate("employer", "name")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch jobs" });
  }
});

// Get one job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "name");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: "Invalid job ID" });
  }
});

// Create a job (employers only)
router.post("/", protect, employerOnly, async (req, res) => {
  try {
    const {
      title, company, location, category, type,
      salary, description, requirements
    } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        message: "Title, company, location, and description are required",
      });
    }

    const job = await Job.create({
      title, company, location, category, type,
      salary, description, requirements,
      employer: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Could not create job" });
  }
});

// Delete your own job (employers only)
router.delete("/:id", protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own jobs",
      });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete job" });
  }
});

module.exports = router;