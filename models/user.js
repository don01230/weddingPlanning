//reference source:
//https://scotch.io/tutorials/easy-node-authentication-setup-and-local
// app/models/user.js
/***********************************************
Module to model user

module name: user
programmer: LAI KIN WA
version: 2.0 (3 April 17)

************************************************/
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        username     : String,
        email        : String,
        password     : String,
        email        : String,
        gender       : String,
        dob          : Date,
        status       : String,
        image        : String
    }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
