const mongoose = require('mongoose')

const AudSchema = mongoose.Schema({
    audioBook: {
        
        type: String,
        required: true
    
},
image: {
        
    type: String,
    required: true

},
}, {
    timestamps: true
})

module.exports = mongoose.model('Aud', AudSchema)