const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({
email: {
    type: String,
    required: true,
    unique: true
},


password: {
    type: String,
    required: true
},
admin: {
    type: Number,
    default: 0

}

}, {
    timestamps: true
})

module.exports = mongoose.model('Admin', AdminSchema)