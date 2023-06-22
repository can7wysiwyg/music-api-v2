const GenreRoute = require("express").Router();
const verify = require("../middleware/verify");
const authAdmin = require("../middleware/authAdmin");
const Genre = require("../models/AudioBookGenreModel");
const asyncHandler = require("express-async-handler");

GenreRoute.post(
  "/genre/create_genre",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { bookGenre } = req.body;

    if (!bookGenre) res.json({ msg: "field cannot be emptyy" });

    await Genre.create({
      bookGenre,
    });

    res.json({ msg: "genre has been succesfully created." });
  })
);

GenreRoute.put(
  "/genre/edite_genre/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await Genre.findByIdAndUpdate(id, req.body);

    res.json({ msg: "Succesfully updateddd..." });
  })
);

GenreRoute.delete(
  "/genre/delete_genre/:id",
  verify,
  authAdmin,
  asyncHandler(async (req, res) => {

 await Genre.findByIdAndDelete(req.params.id)

 res.json({msg: "succesfully deleted..."})

  })
);

GenreRoute.get('/genre/show_all', asyncHandler(async(req, res) => {
    const results = await Genre.find()

    res.json({results})
}))

module.exports = GenreRoute;
