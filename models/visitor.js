const mongoose = require('mongoose');
const Degree = require('./degree');
const Schema = mongoose.Schema;


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    contactnumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    people: {
        type: Number,
        reuiqred : true
    },
    select_package: {
        type: String
    },
    // degree: [{
    //     type : Schema.Types.ObjectId,
    //     ref: 'Degree'
    // }],
    updated: { 
        type: Date,
        default: Date.now 
    },
    attended: {
        type: Boolean,
        default: false
    },

})

module.exports = mongoose.model('Visitor', userSchema);