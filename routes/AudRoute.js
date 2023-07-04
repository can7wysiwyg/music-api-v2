const AudRoute = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Aud = require("../models/AudioMod");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


AudRoute.post(
  "/test",
  upload.fields([
    { name: "audioBook", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { audioBook, image } = req.files;

      if (!audioBook || !image) {
        return res
          .status(400)
          .json({ error: "Audio and image files are required" });
      }

      // Upload the audio file to Cloudinary
      const audioResult = await cloudinary.uploader.upload(audioBook[0].path, {
        resource_type: "auto", // Set resource type to "auto" to handle different file types
      });

      // Upload the image file to Cloudinary
      const imageResult = await cloudinary.uploader.upload(image[0].path);

      // Create a new audio document in the database
      const newAudio = new Aud({
        audioBook: audioResult.secure_url, // <-- Update field name to audioBook
        image: imageResult.secure_url, // <-- Update field name to image
        // Other fields associated with the audio (e.g., title, description, etc.)
      });

      await newAudio.save(); // Save the new audio document to MongoDB

      res.json({
        msg: "Audio and image files uploaded successfully",
        audio: newAudio,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  }
);

module.exports = AudRoute;
