const AuthorRoute = require("express").Router();
const asyncHandler = require("express-async-handler");
const Author = require("../models/AuthorModel");
const verify = require("../middleware/verify");
const authAdmin = require("../middleware/authAdmin");
const path = require("path");
const fs = require("fs");
const cloudinary = require('cloudinary').v2


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME , 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


AuthorRoute.post(
  "/author/create",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { AuthorName, AuthorLocation, AuthorEmail, AuthorPhoneNumber } = req.body;

    if (!AuthorName || !AuthorLocation || !AuthorEmail || !AuthorPhoneNumber) {
      return res.json({ msg: "An important field is missing! Please check." });
    }
    if (!req.files || !req.files.AuthorImage) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.AuthorImage;
    try {

      cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'testImage',
        width: 150,
        height: 150,
        crop: "fill"
      }, async (err, result) => {
        if (err) throw err;
    
        removeTmp(file.tempFilePath);


        await Author.create({
          AuthorName,
          AuthorEmail,
          AuthorLocation,
          AuthorPhoneNumber,
          AuthorImage: result.secure_url,
        });

        res.json({ msg: "author has been successfully created." });
  

      });

     
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
  asyncHandler(async (req, res) => {
  
    const { id } = req.params;

      const author = await Author.findById(id);

      if (!author) {
        return res.status(404).json({ msg: "Book not found." });
      }

      if (author.AuthorImage) {
        const publicId = book.bookImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ msg: "No file uploaded." });
      }

      const AuthorImage = req.files.AuthorImage;

      const result = await cloudinary.uploader.upload(AuthorImage.tempFilePath);

      author.AuthorImage = result.secure_url;

      await author.save();

      fs.unlinkSync(AuthorImage.tempFilePath);

      res.json({ msg: "picture updated successfully." });


    
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


function removeTmp(filePath) {
  fs.unlink(filePath, err => {
    if (err) throw err;
  });
}