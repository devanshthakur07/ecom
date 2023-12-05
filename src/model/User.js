const { boolean } = require('joi');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    mobile: {
        type: String,
        // required: true,
        
    },
    email: {
        type: String,
        required: true,
        trim:true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        trim:true,

    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    token:{
        type:String,
        default:''
    },
    tokenExp:{
        type:Number
    },
    tokens:[{type:Object}]
 
})

module.exports = mongoose.model('User', userSchema);