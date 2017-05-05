var mongoose = require('mongoose');
var User = require('../models/user');
var Activity = require('../models/Activity');

var Schema = mongoose.Schema;
var CommentSchema = new Schema({
    comments : String,
    date : Date,
    userID: {type: Schema.Types.ObjectId, ref: 'User'},
    activityID : {type:Schema.Types.ObjectId,ref:'Activity'}
},{collection: 'comment'});

var comment = mongoose.model('collection', CommentSchema);

module.exports = comment;
