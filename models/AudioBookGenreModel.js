const mongoose = require('mongoose')


const GenreSchema = mongoose.Schema({

    bookGenre: {
        type: String,
        required: true,
        unique: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Genre', GenreSchema)