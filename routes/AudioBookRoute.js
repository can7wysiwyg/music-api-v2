const AudioBookRoute = require("express").Router();
const verify = require("../middleware/verify");
const authAdmin = require("../middleware/authAdmin");
const AudioBook = require("../models/AudioBookModel");
const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const cloudinary = require('cloudinary').v2;



cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


AudioBookRoute.post('/audio/create_audio', verify, authAdmin, async (req, res) => {
  const { authorName, audioGenre, bookTitle, released, bookDescription } = req.body;

  if (!authorName || !audioGenre || !bookTitle || !released || !bookDescription) {
    return res.status(400).json({ error: 'Field cannot be empty' });
  }

  try {
    if (!req.files || !req.files.audioBook || !req.files.audioImage) {
      return res.status(400).json({ error: 'Please provide both audio and image files' });
    }

    // Upload the audio book file to Cloudinary
    const audioBookResult = await cloudinary.uploader.upload(req.files.audioBook.tempFilePath, {
      resource_type: 'auto', // Set resource type to "auto" to handle different file types
    });

    // Upload the audio image file to Cloudinary
    const audioImageResult = await cloudinary.uploader.upload(req.files.audioImage.tempFilePath);

    const audioK = new AudioBook({
      authorName,
      bookTitle,
      audioGenre,
      released,
      bookDescription,
      audioBook: audioBookResult.secure_url,
      audioImage: audioImageResult.secure_url,
    });

    await audioK.save();

    // Delete the audio and image files from the temporary uploads folder
    fs.unlinkSync(req.files.audioBook.tempFilePath);
    fs.unlinkSync(req.files.audioImage.tempFilePath);

    res.json({
      msg: 'Audio and image files uploaded successfully',
      audio: audioK,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});





AudioBookRoute.put(
  "/audio/update_audio_only/:id",
  verify,
  authAdmin,
  
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await AudioBook.findById(id);

    if (!book) {
      return res.status(404).json({ msg: "Book not found." });
    }

    if (book.audioBook) {
      const publicId = book.audioBook.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ msg: "No file uploaded." });
    }

    const audioBook = req.files.audioBook;

    const result = await cloudinary.uploader.upload(audioBook.tempFilePath);

    book.audioBook = result.secure_url;

    await book.save();

    fs.unlinkSync(audioBook.tempFilePath);

    res.json({ msg: "Book audio updated successfully." });



    
  })
);






AudioBookRoute.put("/audio/update_all/:id", verify, authAdmin, asyncHandler(async(req, res) => {

const{id} = req.params

await AudioBook.findByIdAndUpdate(id, req.body)

res.json({msg: "file has been updated"})

}))


AudioBookRoute.put(
  "/audio/update_picture/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const audioBook = await AudioBook.findById(id);
    if (!audioBook) {
      return res.status(404).json({ error: "AudioBook not found" });
    }

    if (req.file) {
      try {
        // Upload the new image file to Cloudinary
        const imageResult = await cloudinary.uploader.upload(req.file.path);

        // Delete the previous image file if it exists
        if (audioBook.audioImage) {
          await cloudinary.uploader.destroy(audioBook.audioImage);
        }

        audioBook.audioImage = imageResult.secure_url;

        // Delete the image file from the temporary uploads folder
        fs.unlinkSync(req.file.path);
      } catch (error) {
        // Error occurred while uploading the new image file
        console.error("Error uploading file:", error);
        return res.status(500).json({ error: "Failed to upload image file", details: error.message });
      }
    }

    try {
      await audioBook.save();
      res.json({ msg: "Photo has been successfully updated" });
    } catch (error) {
      // Error occurred while saving the document
      if (req.file) {
        // Delete the newly uploaded image file if saving failed
        await cloudinary.uploader.destroy(audioBook.audioImage);
        fs.unlinkSync(req.file.path); // Delete the image file from the temporary uploads folder
      }
      console.error("Error saving photo:", error);
      res.status(500).json({ error: "Failed to update photo", details: error.message });
    }
  })
);




AudioBookRoute.delete(
  "/audio/delete_audio_book/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const audioBook = await AudioBook.findById(id);
      if (!audioBook) {
        return res.status(404).json({ error: "AudioBook not found" });
      }

      // Delete the associated image file from Cloudinary
      if (audioBook.audioImage) {
        await cloudinary.uploader.destroy(audioBook.audioImage);
      }

      // Delete the record from MongoDB
      await AudioBook.findByIdAndDelete(id);

      res.json({ msg: "Book has been successfully deleted" });
    } catch (error) {
      console.error("Error deleting audio book:", error);
      res.status(500).json({ error: "Failed to delete audio book", details: error.message });
    }
  })
);



AudioBookRoute.delete('/audio/delete_authors_all/:id', verify, authAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await AudioBook.deleteMany({ authorName: id });

  res.json({ message: 'All records with the specified ID have been deleted.' });
}));



AudioBookRoute.get('/audio/show_all', asyncHandler(async(req, res) => {
    const books = await AudioBook.find()
    res.json({books})
}))

AudioBookRoute.get('/audio/show_single/:id', asyncHandler(async(req, res) => {

  const book = await AudioBook.findOne({_id: req.params.id})

  res.json({book})

}))


AudioBookRoute.get('/audio/show_author_books/:id', asyncHandler(async(req, res) => {
  await AudioBook.find({authorName : req.params.id }).then((books) =>
      res.json({ books })
    );
}))


AudioBookRoute.get('/audio/show_according_to_genre/gnr', asyncHandler(async(req, res) => {

 const books = await AudioBook.find({audioGenre: req.query.genre})

 res.json({books})


}))



module.exports = AudioBookRoute;
