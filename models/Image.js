var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Activity = require('../models/Activity');//require using activity model

var imageSchema = new Schema({
    activityID: {
        type: Schema.Types.ObjectId,
        ref: 'Activity'
    },//ref by acitivity model id
    imageName: String,
    path: String
});

module.exports = mongoose.model('Image', imageSchema);
