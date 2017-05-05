var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

var planSchema = new Schema({
  userID: {type: Schema.Types.ObjectId, ref: 'User'},//ref by user model id
  planTime: { type: Date, default: Date.now },
  planName: { type:String, required: true},
  updateTime: { type: Date, default: Date.now },
  private:Boolean
});

var Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
