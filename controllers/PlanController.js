//======================================
//Brian start===========================
//======================================

var Plan = require('../models/Plan');
var Activity = require('../models/Activity');
var comment = require('../models/Comment');
var User = require('../models/user');
var moment = require('moment');
var image = require('../models/Image');
// render user all relate plan to font-end
exports.userplanslist = function(req, res) {
    var user = req.user;
    console.log("Enter userplanslist");
    console.log(user);
    Plan.find({
        userID: user._id
    }).exec(function(err, plan) {
        if (err) {
            res.status(404);
            return next();
        }
        console.log(plan);
        res.render('userplanslist', {
            plan: plan,
            moment:moment
        });

    });
}
//function for create plan
exports.createplan = function(req, res) {
    var user = req.user;
    if (req.method == "POST") {//function for save plan to server
      console.log("enter create plan");
        console.log(req.body);
        var plan = new Plan();
        plan.userID = user._id;
        plan.planName = req.body.planName;
        if (req.body.private == "on") {
            plan.private = true;
        } else {
            plan.private = false;
        }
        plan.save(function(err) {
            res.redirect('/userplanslist');
        })
    } else if (req.method == "GET") {//render create plan plan to font-end
        var user = req.user;
        res.render("createplan");
    }
}
//function for update plan
exports.updateplan = function(req, res, next) {
    console.log("Enter UpdatePlan");
    var planid = req.params.planId;
    console.log(planid);
    console.log(req.body);
    Plan.findByIdAndUpdate(planid, req.body, function(err, plan) {
        plan.planName = req.body.planName;//update information
        if (req.body.private == "on") {
            plan.private = true;
        } else {
            plan.private = false;
        }
        plan.updateTime = new Date();

        plan.save(function(err) {//save update information
            res.redirect('/userplanslist');
        })
    });
}
//render all activity information by planid
exports.findPlanById = function(req, res, next) {
    var user = req.user;
    console.log("Enter FindPlanById");
    var planid = req.params.planId;
    console.log(planid);
    console.log(user);
    var Commentlist = [];
    Plan.findById(planid).exec(function(err, plan) {//find plan by object id
        if (err) {
            res.status(404);
            return next();
        }
        Activity.find({//find all activity by plan id and sort by date
            planID: planid
        }).sort({
            activityTime: +1
        }).exec(function(err, activity) {
            if (err) {
                res.status(404);
                return next();
            }
                    User.findById(plan.userID).exec(function(err, planOwner) {//find plan owner
                        if (err) {
                            res.status(404);
                        }
                        if (plan) {
                          for (var i=0; i < activity.length; i++)
                            Commentlist.push(activity[i]._id);//find all activity comment
                            comment.find({activityID:Commentlist}).populate('userID').exec(function(err, comments) {
                              console.log(comments);
                                image.find({activityID:Commentlist}).exec(function(err, images) {
                                    console.log(images);
                                    res.render('showPlan.ejs', {
                                        plan: plan,
                                        user: user,
                                        activity: activity,
                                        comments: comments,
                                        moment: moment,
                                        planOwner: planOwner,
                                        images: images
                                    });
                                });
                            });
                        }
                    });
        });
    });
};
//function for delete plan from db
exports.deleteplan = function(req, res, next) {
    var user = req.user;
    console.log("Enter deletplan");
    var planid = req.params.planId;

    Plan.findByIdAndRemove(planid, function(err, plan) {
      console.log(plan);
      Activity.remove({planID:planid},function(err,activityfind){
          var abc= this._id;
          console.log(abc);
          console.log(activityfind);
          if (err) {
            res.status(404);
            return next();
        } else {
            res.redirect('/userplanslist');
        }
      });
    });
};
//======================================
//Brian end ============================
//======================================


exports.browseplans = function(req, res, next){
  // the defualt serach criteria is stored in searchSettingHash
  var searchSettingHash = {};
  searchSettingHash["name"] = "";
  searchSettingHash["inputStart"] = "1970-01-01";
  searchSettingHash["inputEnd"] = "2099-12-31";
  searchSettingHash["displayStart"] = "01-01-1970";
  searchSettingHash["displayEnd"] = "31-12-2099";
  // only the more recent 20 records are shown
  Plan.find({private: false})
  .sort({updateTime: "descending"})
  .skip(0)
  .limit(20)
  .populate('userID')
  .exec(function(err, plans){
    Plan.count({
      private: false
    }, function(err, c){
      console.log("c = ", c);
      res.render('planList.ejs', {
        user: req.user,
        listOfPlan: plans,
        currentPage: 1,
        minP: 1,
        maxP: 3,
        searchSettingHash: searchSettingHash
      });
    });
  });
};

exports.searchplans = function(req, res, next){
  // searchSettingHash stores the serach criteria
  // which will be passed back to the front end
  var searchSettingHash = {};
  searchSettingHash["name"] = req.body.name;
  searchSettingHash["searchStart"] = new Date(req.body.start);
  searchSettingHash["searchEnd"] = new Date(req.body.end);
  searchSettingHash["searchEnd"] = new Date(searchSettingHash["searchEnd"].getTime() + 24*60*60*1000 - 1);

  var tStart = searchSettingHash["searchStart"].toISOString(); var tEnd = searchSettingHash["searchEnd"].toISOString();
  searchSettingHash["inputStart"] = tStart.substring(0,10);
  searchSettingHash["inputEnd"] = tEnd.substring(0,10);
  searchSettingHash["displayStart"] = tStart.substring(8,10)+"-"+tStart.substring(5,7)+"-"+tStart.substring(0,4);
  searchSettingHash["displayEnd"] = tEnd.substring(8,10)+"-"+tEnd.substring(5,7)+"-"+tEnd.substring(0,4);
  console.log("search: "); console.log(searchSettingHash);

  Plan.find({
    private: false,
    planName: new RegExp(searchSettingHash["name"], 'i'),
    updateTime: {
      $gte: searchSettingHash["searchStart"],
      $lte: searchSettingHash["searchEnd"]
    }
  })
  .sort({updateTime: "descending"})
  .skip((req.body.nextPage-1)*20)
  .limit(20)
  .populate('userID')
  .exec(function(err, plans){
    Plan.count({
      private: false,
      planName: new RegExp(req.body.name, 'i'),
      updateTime: {
        $gte: searchSettingHash["searchStart"],
        $lte: searchSettingHash["searchEnd"]
      }
    }, function(err, c){
      res.render('planList.ejs', {
        user: req.user,
        listOfPlan: plans,
        currentPage: req.body.nextPage,
        // see if there are at least 2 page before and after the desired page
        minP: Math.max(parseInt(req.body.nextPage) - 2, 1),
        maxP: Math.min(parseInt(req.body.nextPage) + 2, Math.ceil(c/20.0)),
        searchSettingHash: searchSettingHash
      });
    });
  });
};
