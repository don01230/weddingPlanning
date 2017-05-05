var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');//require using user model
var Plan = require('../models/Plan');//require using Plan model

var activitySchema = new Schema({
  planID: { type: Schema.Types.ObjectId, ref: 'Plan' }, //planID is ref by plan model objectid
  activitySub: { type: String, required: true},
  activityContent: { type: String },
  activityTime: { type: Date },
  activityLoc: { type: String },
  activityCat: { type: String },
  activityCost: { type: Number },
  userRating: { type: Number },
  publicRating: { type: Number },
  ratingTotal: { type: Number },
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
