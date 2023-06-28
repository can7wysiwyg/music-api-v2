const mongoose = require('mongoose')

const AuthorSchema = mongoose.Schema({
    AuthorName: {
        type: String,
        required: true,

    },
    AuthorLocation: {
        type: String,
        required: true
    },
    AuthorEmail: {
        type: String,
        required: true,
        unique: true,

    },
    AuthorPhoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    AuthorImage: {
        authorImageLink: {
            type: String,
            required: true
          }
      
        
    }

}, {
    timestamps: true
}) 


module.exports = mongoose.model('Author', AuthorSchema)