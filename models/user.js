//import packages
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

//create Schema
var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['customer','employee','admin'],
        default: 'customer'
    },
    pancard: {
        type: Number,
        unique: true,
        required: true
    },
    logout: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
});

//passport plugin
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
