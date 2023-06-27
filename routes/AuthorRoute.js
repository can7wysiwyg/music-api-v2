const AuthorRoute = require("express").Router();
const asyncHandler = require("express-async-handler");
const Author = require("../models/AuthorModel");
const verify = require("../middleware/verify");
const authAdmin = require("../middleware/authAdmin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const upload = multer({ storage });

AuthorRoute.post(
  "/author/create",
  verify,
  authAdmin,
  upload.single("AuthorImage"),
  asyncHandler(async (req, res) => {
    const { AuthorName, AuthorLocation, AuthorEmail, AuthorPhoneNumber } =
      req.body;

    if ((!AuthorName || !AuthorLocation, !AuthorEmail || !AuthorPhoneNumber))
      res.json({ msg: "An important field is missing! Please check." });

    await Author.create({
      AuthorName,
      AuthorEmail,
      AuthorLocation,
      AuthorPhoneNumber,
      AuthorImage: {
        authorImageLink: req.file.path, // Save the image path in the database
      },
    });

    res.json({ msg: "Account has been successfully created." });
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

    // Delete the old image from the file system if it exists
    if (author.AuthorImage && author.AuthorImage.authorImageLink) {
      const oldImagePath = author.AuthorImage.authorImageLink;
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Error deleting old image:", err);
        }
      });
    }

    // Update the author's profile picture in the database
    author.AuthorImage = {
      authorImageLink: req.file.path, // Save the new image path in the database
    };

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
