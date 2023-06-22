const AudioBookRoute = require("express").Router();
const verify = require("../middleware/verify");
const authAdmin = require("../middleware/authAdmin");
const AudioBook = require("../models/AudioBookModel");
const asyncHandler = require("express-async-handler");
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
  fileFilter: function (req, file, cb) {
    if (file.minetype === "audio/mp3" || file.minetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(null, false, "Invalid File formats. Upload mp3 or jpg");
    }
  },
});

const Fileuploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 13,
  },
}).fields([{ name: "audioBook" }, { name: "audioImage" }]);

const singleAudio = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 13,
  },
}).single("audioBook");

const singleImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 13,
  },
}).single("audioImage");

AudioBookRoute.post(
  "/audio/create_audio",
  verify,
  authAdmin,
  Fileuploads,
  asyncHandler(async (req, res) => {
    const { authorName, audioGenre, bookTitle, released } = req.body;

    if (!authorName || !audioGenre || !bookTitle || !released)
      res.json({ msg: "field cannot be empty" });

    await AudioBook.create({
      authorName,
      bookTitle,
      audioGenre,
      released,
      audioBook: {
        data: fs.readFileSync(
          "./uploads/" + req.files["audioBook"][0].filename
        ),
        contentType: "audio/mp3",
      },
      audioImage: {
        data: fs.readFileSync(
          "./uploads/" + req.files["audioImage"][0].filename
        ),
        contentType: "image/jpg",
      },
    });

    res.json({ msg: "audiobook has been succesfully uploaded..." });
  })
);

AudioBookRoute.put(
  "/audio/update_audio_only/:id",
  verify,
  authAdmin,
  singleAudio,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await AudioBook.findByIdAndUpdate(id, {
      audioBook: {
        data: fs.readFileSync("./uploads/" + req.file.filename),
        contentType: "audio/mp3",
      },
    });

    res.json({ msg: "succesfully updated" });
  })
);

AudioBookRoute.put(
  "/audio/update_picture/:id",
  verify,
  authAdmin,
  singleImage,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await AudioBook.findByIdAndUpdate(id, {
      audioImage: {
        data: fs.readFileSync("./uploads/" + req.file.filename),
        contentType: "image/jpg",
      },
    });

    res.json({ msg: "photo has been succesfully updated...." });
  })
);

AudioBookRoute.put(
  "/audio/update_text_fields/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await AudioBook.findByIdAndUpdate(id, req.body);

    res.json({ msg: "fields succesfully updated" });
  })
);

AudioBookRoute.delete(
  "/audio/delete_audio_book/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {

    await AudioBook.findByIdAndDelete(req.params.id)

    res.json({msg: "book has been succesfully deleted"})


  })
);

AudioBookRoute.get('/audio/show_all', asyncHandler(async(req, res) => {
    const results = await AudioBook.find()
    res.json({results})
}))

AudioBookRoute.get('/audio/show_according_to_genre/gnr', asyncHandler(async(req, res) => {

 const results = await AudioBook.find({audioGenre: req.query.genre})

 res.json({results})


}))



module.exports = AudioBookRoute;
