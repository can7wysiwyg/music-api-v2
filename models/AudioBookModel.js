const  mongoose = require('mongoose')

const AudioSchema = mongoose.Schema({
    authorName: {
        type: String,
        required: true
    
    }
    ,
    audioGenre: {
        type: String,
        required: true

    },
    bookTitle: {
        type: String,
        required: true,

    },
    audioBook: {
        data: Buffer,
        contentType: String
    },
    audioImage: {
       data: Buffer,
        contentType: String  
    },
    released: {
       type: String,
       required: true 
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('AudioBook', AudioSchema)
