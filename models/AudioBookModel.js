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
        
        type: String,
        required: true
      
  
    
},
    
    
    audioImage: {
        
            type: String,
            required: true
          
      
        
    },
    bookDescription: {
    
        type: String,
        required: true

    },
    released: {
       type: Date,
       required: true 
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('AudioBook', AudioSchema)
