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
    if (file.mimetype === "audio/mp3" || file.mimetype === "image/jpeg") {
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
        audioLink: "/uploads/" + req.files["audioBook"][0].filename,
      },
      audioImage: {
        imageLink: "/uploads/" + req.files["audioImage"][0].filename,
      },
    });

    res.json({ msg: "audiobook has been successfully uploaded..." });
  })
);





AudioBookRoute.put(
  "/audio/update_audio_only/:id",
  verify,
  authAdmin,
  singleAudio,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const audioBook = await AudioBook.findById(id);
    if (!audioBook) {
      return res.status(404).json({ error: "AudioBook not found" });
    }

    if (req.file) {
      // Delete the previous audio file if it exists
      if (audioBook.audioBook && audioBook.audioBook.audioLink) {
        const filePath = audioBook.audioBook.audioLink;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      audioBook.audioBook = {
        audioLink: req.file.path,
      };
    }

    // Ensure that audioImage.imageLink is provided in the request body
    if (req.body.audioImage && req.body.audioImage.imageLink) {
      audioBook.audioImage = {
        imageLink: req.body.audioImage.imageLink,
      };
    }

    try {
      await audioBook.save();
      res.json({ msg: "Successfully updated" });
    } catch (error) {
      // Error occurred while saving the document
      if (req.file) {
        // Delete the newly uploaded audio file if saving failed
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({ error: "Failed to update audio" });
    }
  })
);






AudioBookRoute.put(
  "/audio/update_picture/:id",
  verify,
  authAdmin,
  singleImage,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const audioBook = await AudioBook.findById(id);
    if (!audioBook) {
      return res.status(404).json({ error: "AudioBook not found" });
    }

    if (req.file) {
      // Delete the previous image file if it exists
      if (audioBook.audioImage && audioBook.audioImage.imageLink) {
        const filePath = audioBook.audioImage.imageLink;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      audioBook.audioImage = {
        imageLink: req.file.path,
      };
    }

    try {
      await audioBook.save();
      res.json({ msg: "Photo has been successfully updated" });
    } catch (error) {
      // Error occurred while saving the document
      if (req.file) {
        // Delete the newly uploaded image file if saving failed
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({ error: "Failed to update photo" });
    }
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
