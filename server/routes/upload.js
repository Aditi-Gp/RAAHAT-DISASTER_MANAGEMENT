const express = require("express");
const {
  uploadGovernmentId,
  uploadGeneral,
  deleteFile,
} = require("../config/cloudinary");
const { protect } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// @route   POST /api/upload/government-id
// @desc    Upload government ID document
// @access  Private
router.post(
  "/government-id",
  protect,
  uploadGovernmentId.single("governmentId"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Please select a government ID document.",
        });
      }

      // File upload successful
      res.status(200).json({
        success: true,
        message: "Government ID uploaded successfully",
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          format: req.file.format,
          resourceType: req.file.resource_type,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Government ID upload error:", error);

      // Handle multer errors
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
      }

      if (error.message.includes("Invalid file type")) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only JPG, PNG, and PDF files are allowed.",
        });
      }

      next(error);
    }
  }
);

// @route   POST /api/upload/government-id-public
// @desc    Upload government ID document during registration (public)
// @access  Public
router.post(
  "/government-id-public",
  uploadGovernmentId.single("governmentId"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Please select a government ID document.",
        });
      }

      // File upload successful
      res.status(200).json({
        success: true,
        message: "Government ID uploaded successfully",
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          format: req.file.format,
          resourceType: req.file.resource_type,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Government ID upload error:", error);

      // Handle multer errors
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
      }

      if (error.message.includes("Invalid file type")) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only JPG, PNG, and PDF files are allowed.",
        });
      }

      next(error);
    }
  }
);

// @route   POST /api/upload/file
// @desc    Upload general file
// @access  Private
router.post(
  "/file",
  protect,
  uploadGeneral.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
        });
      }

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          format: req.file.format,
          resourceType: req.file.resource_type,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      next(error);
    }
  }
);

// @route   DELETE /api/upload/:publicId
// @desc    Delete uploaded file
// @access  Private
router.delete("/:publicId", protect, async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    const result = await deleteFile(publicId);

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "File deleted successfully",
        data: { publicId, deletedAt: new Date().toISOString() },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found or already deleted",
      });
    }
  } catch (error) {
    console.error("File deletion error:", error);
    next(error);
  }
});

// @route   GET /api/upload/health
// @desc    Check upload service health
// @access  Public
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Upload service is running",
    timestamp: new Date().toISOString(),
    services: {
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      multer: true,
    },
    limits: {
      governmentId: "5MB",
      generalFile: "10MB",
    },
    supportedFormats: {
      governmentId: ["jpg", "jpeg", "png", "pdf"],
      generalFile: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    },
  });
});

module.exports = router;
