import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import Video from "../models/Video.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
});

// Helper: Cloudinary upload stream from buffer
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "youtube_clone_videos",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// GET all videos (newest first)
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload new video
router.post("/", upload.single("video"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Video title is required" });
    }

    // Optional user info from Bearer token if logged in
    let channelName = "Creator";
    let uploadedBy = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        uploadedBy = decoded.id;
        if (decoded.name) channelName = decoded.name;
      } catch {
        // Ignore invalid/expired token and keep default channelName
      }
    }

    const cloudResult = await uploadBufferToCloudinary(req.file.buffer);

    // Cloudinary automatically generates a jpg thumbnail for uploaded videos
    const autoThumbnail = cloudResult.secure_url.replace(/\.[^/.]+$/, ".jpg");

    const newVideo = await Video.create({
      title: title.trim(),
      description: (description || "").trim(),
      videoUrl: cloudResult.secure_url,
      thumbnail: autoThumbnail,
      channelName,
      uploadedBy,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Helper: Extract Cloudinary public_id from secure_url if available
const getCloudinaryPublicId = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes("cloudinary.com")) return null;
  const match = videoUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^/.]+$/);
  return match ? match[1] : null;
};

// DELETE video by ID from MongoDB & Cloudinary
router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const publicId = getCloudinaryPublicId(video.videoUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "video",
        });
      } catch {
        // Continue deleting from DB even if Cloudinary cleanup fails
      }
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete video" });
  }
});

export default router;