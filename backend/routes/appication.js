
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Application = require("../models/Application");
const Job = require("../models/Job");
const { protect } = require("../middleware/auth");
const { app } = require("../server");
const applicationRoutes = require("./routes/applications");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ".pdf";
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      path.extname(file.originalname).toLowerCase() === ".pdf" &&
      file.mimetype === "application/pdf"
    ) {
      return cb(null, true);
    }
    cb(new Error("Please upload a PDF CV only."));
  },
});

router.post("/", protect, (req, res) => {
  upload.single("cv")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.code === "LIMIT_FILE_SIZE"
          ? "CV must be 5 MB or smaller."
          : err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please attach a PDF CV." });
    }

    try {
      const { jobId } = req.body;
      const job = await Job.findById(jobId);

      if (!job) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Job not found." });
      }

      if (String(job.employer) === String(req.user._id)) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          message: "You cannot apply to your own job.",
        });
      }

      const application = await Application.create({
        job: job._id,
        applicant: req.user._id,
        cvFilename: req.file.originalname,
        cvPath: req.file.filename,
      });

      res.status(201).json({
        message: "Application submitted successfully!",
        application,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (error.code === 11000) {
        return res.status(409).json({
          message: "You have already applied to this job.",
        });
      }

      res.status(500).json({ message: "Could not submit application." });
    }
  });
});

module.exports = router;
app.use("/api/applications", applicationRoutes);
