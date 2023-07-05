const AuthorRoute = require("express").Router();
const asyncHandler = require("express-async-handler");
const Author = require("../models/AuthorModel");
const verify = require("../middleware/verify");
const authAdmin = require("../middleware/authAdmin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require('cloudinary')

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
  cloud_name: process.env.CLOUD_NAME , 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


AuthorRoute.post(
  "/author/create",
  verify,
  authAdmin,
  upload.single("AuthorImage"),
  asyncHandler(async (req, res) => {
    const { AuthorName, AuthorLocation, AuthorEmail, AuthorPhoneNumber } = req.body;

    if (!AuthorName || !AuthorLocation || !AuthorEmail || !AuthorPhoneNumber) {
      return res.json({ msg: "An important field is missing! Please check." });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path);

      // Delete the temporary file from the local server
      fs.unlinkSync(req.file.path);

      await Author.create({
        AuthorName,
        AuthorEmail,
        AuthorLocation,
        AuthorPhoneNumber,
        AuthorImage: result.secure_url,
      });

      res.json({ msg: "Account has been successfully created." });
    } catch (error) {
      console.error("Error creating author:", error);
      res.status(500).json({ error: "Failed to create author" });
    }
  })
);



AuthorRoute.put(
  "/author/edit_profile_info/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await Author.findByIdAndUpdate(id, req.body);

    res.json({ msg: "updated successfully" });
  })
);


AuthorRoute.put(
  "/author/update_profilePic/:id",
  verify,
  authAdmin,
  upload.single("AuthorImage"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the author in the database
    const author = await Author.findById(id);

    // Check if the author exists
    if (!author) {
      return res.status(404).json({ msg: "Author not found." });
    }

    // Delete the old image from Cloudinary if it exists
    if (author.AuthorImage) {
      const publicId = author.AuthorImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Upload the new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Update the author's profile picture in the database
    author.AuthorImage = result.secure_url; // Save the new image URL in the database

    await author.save();

    res.json({ msg: "Profile picture updated successfully." });
  })
);




AuthorRoute.delete('/author/delete_author/:id', verify, authAdmin, asyncHandler(async(req, res) => {

    const {id} = req.params

     await Author.findByIdAndDelete(id)

     res.json({msg: "successfully deleted"})


}))

AuthorRoute.get('/author/show_all', asyncHandler(async(req, res) => {

  const authors = await Author.find()

  res.json({authors})

}))

AuthorRoute.get('/author/show_single/:id', asyncHandler(async(req, res) => {

  const result = await Author.findOne({_id: req.params.id})

  res.json({result})

}))

module.exports = AuthorRoute;
