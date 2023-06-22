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
      res.json({ msg: "an important field is missing! please check" });

    await Author.create({
      AuthorName,
      AuthorEmail,
      AuthorLocation,
      AuthorPhoneNumber,
      AuthorImage: {
        data: fs.readFileSync("./uploads/" + req.file.filename),
        contentType: "image/jpg",
      },
    });

    res.json({ msg: "account has been successfully created" });
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

    await Author.findByIdAndUpdate(
        id,
        {
            AuthorImage: {
            data: fs.readFileSync("./uploads/" + req.file.filename),
            contentType: "image/jpg",
          },
        },
        { new: true }
      );
  
      res.json({ msg: "successfully updated" });
  
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
