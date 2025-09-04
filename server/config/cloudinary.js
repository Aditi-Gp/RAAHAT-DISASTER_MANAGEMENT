const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for government ID documents
const governmentIdStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "raahat/government-ids",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [
      { width: 1000, height: 1000, crop: "limit", quality: "auto" },
    ],
    resource_type: "auto",
  },
});

// Configure Cloudinary storage for general uploads
const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "raahat/uploads",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    transformation: [
      { width: 1000, height: 1000, crop: "limit", quality: "auto" },
    ],
    resource_type: "auto",
  },
});

// Create multer instances
const uploadGovernmentId = multer({
  storage: governmentIdStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only images and PDFs are allowed."),
        false
      );
    }
  },
});

const uploadGeneral = multer({
  storage: generalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper functions
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  };

  return cloudinary.url(publicId, defaultOptions);
};

module.exports = {
  cloudinary,
  uploadGovernmentId,
  uploadGeneral,
  deleteFile,
  getOptimizedUrl,
};
