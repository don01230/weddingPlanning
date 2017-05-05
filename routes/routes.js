//reference source:
//https://scotch.io/tutorials/easy-node-authentication-setup-and-local
// app/routes.js
var Image=require('../models/Image');
var User = require('../models/user');
var Activity = require('../models/Activity');
var comment = require('../models/Comment');
var Plan = require('../models/Plan');
var controller = require('../controllers/PlanController'); // plan controll.
var Actimgcontroller = require('../controllers/ActivityImageController'); //ActivityImage Control
var express = require('express');
var moment = require('moment');
var router = express.Router();
ObjectId = require('mongodb').ObjectID;

module.exports = function(app, passport) {
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('home.ejs', { message: req.flash('loginMessage') });
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

  app.get('/loginFail', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('loginFail.ejs', { message: req.flash('loginMessage') });
  });

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/viewMyProfile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/home', isLoggedIn, function(req, res) {
		res.render('home.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});
//view my profile
	app.get('/viewMyProfile', isLoggedIn, function(req, res) {
		Plan.count({userID: req.user._id},function(err,countPlan){
			//show the photos randomly in personal homepage
			console.log("count:"+countPlan);
			var random=Math.floor(Math.random()*countPlan)
			Plan.findOne({userID: req.user._id}).skip(random).exec(
				function(err,plan){
					if(!plan){
						//res.send("There was a problem finding the user's plans.");
						res.render('viewMyProfile.ejs', {
							user : req.user,
							newUser : true
						});
					}else{
						console.log(plan.planName);
						Activity.count({planID:plan._id},function(err,countActivity){
							random=Math.floor(Math.random()*countActivity)
							console.log("countActivity:"+countActivity);
							Activity.findOne({planID:plan._id}).skip(random).exec(
								function(err,activity){
								if(!activity){
									res.render('viewMyProfile.ejs', {
										user : req.user,
										newUser : true
									});
								}else{
									console.log("activity:"+activity.activitySub);
									Image.find({activityID:activity._id},function(err,images){
										if(!images){
											res.render('viewMyProfile.ejs', {
												user : req.user,
												newUser : true
											});
										}else{
											console.log("imageLength:"+images.length);
											if(images.length==0){
												res.render('viewMyProfile.ejs', {
													user : req.user,
													newUser : true
												});
											}else{
											for(var i=0;i<images.length;i++){
													var str=images[i].path;
													var temp=str.replace("public/"," ");
													images[i].path=temp;
													console.log(images[i].path);
												}
												res.render('viewMyProfile.ejs', {
													user : req.user,
													imageList : images,
													newUser : false
												});
											}
										}
									})
								}
							})
						})
					}
				})
		})
	});

//editProfile
	app.get('/editProfile', isLoggedIn, function(req, res) {
		res.render('editProfile.ejs', {
			user : req.user, // get the user out of session and pass to template
			message: req.flash('signupMessage')
		});
	});

	app.post('/editProfile', function(req, res) {
		console.log(req.body.username);
		User.findOne({email: req.body.email},function(err,user){
			console.log(req.body.email);
			if(!user){
				res.send("There was a problem adding the information to the database.");
			}else{
			  user.modified=new Date();
				user.local.password=req.body.password;
				user.local.username= req.body.username;
				//user.local.password = user.generateHash(password); // use the generateHash function in our user model
				user.local.gender=req.body.gender;
				user.local.dob=req.body.dob;
				user.local.status=req.body.status;
// save the user
				user.save(function(err) {
						if (err)
							console.log('error')
						else{
							console.log('success')
							res.location("viewMyProfile");
							res.redirect("viewMyProfile");
						}
				});
			}
		})
	});

  router.get('/planList',isLoggedIn,controller.browseplans);
  router.post('/planList',isLoggedIn,controller.searchplans);
  router.get('/activityList', isLoggedIn, function(req, res){
    // default search criteria are stored in searchSettingHash
    // which will be passed back to the front end
    var searchSettingHash = {};
    searchSettingHash["searchStart"] = new Date('1970-01-01');
		searchSettingHash["searchEnd"] = new Date('2099-12-31');
		searchSettingHash["searchEnd"] = new Date(searchSettingHash["searchEnd"].getTime() + 24*60*60*1000 - 1);
		searchSettingHash["name"] = "";
		var tStart = searchSettingHash["searchStart"].toISOString(); var tEnd = searchSettingHash["searchEnd"].toISOString();
	  searchSettingHash["inputStart"] = tStart.substring(0,10);
	  searchSettingHash["inputEnd"] = tEnd.substring(0,10);
	  searchSettingHash["displayStart"] = tStart.substring(8,10)+"-"+tStart.substring(5,7)+"-"+tStart.substring(0,4);
	  searchSettingHash["displayEnd"] = tEnd.substring(8,10)+"-"+tEnd.substring(5,7)+"-"+tEnd.substring(0,4);
		searchSettingHash["category"] = ["Mustard", "Ketchup", "Relish", null];

 		searchSettingHash["sortBy"] = "updateTime";
    searchSettingHash["sortOrder"] = "descending";
		searchSettingHash["lowCost"] = 0;
		searchSettingHash["highCost"]  = 99999999;
    console.log("GET: "); console.log(searchSettingHash);

		var ts = new Date('2010-01-01');
		var te = new Date('2011-01-01');

    var publicPlan = [];
    Plan.find({private: false}).exec(function(err, plans){
      for (var i=0; i < plans.length; i++)
        publicPlan.push(plans[i]._id);
			Activity.count({planID: {$in: publicPlan}}, function(err, c){
        Activity.find({planID: {$in: publicPlan}})
        .sort({[searchSettingHash["sortBy"] ]: [searchSettingHash["sortOrder"] ]})
        .limit(20)
        .populate({
    			path: 'planID', model: "Plan",
          populate: {path: "userID", model: "User"}}).exec(function(err, acts){
    				console.log(acts);
            console.log("c = ", c, "maxP  = ", Math.ceil(c/20.0))
  	        searchSettingHash["sortBy"] = "suggested";
  	        searchSettingHash["sortOrder"] = "dafault";
  	    		res.render('activityList.ejs', {
  	        listOfAct: acts,
  					currentPage: 1,
            minP: 1,
            // check if there are at least 3 pages (=60) of activities
            maxP: Math.ceil(c/20.0),
  	        searchSettingHash: searchSettingHash,
          });
        });
			});
    });


  });
  router.post('/activityList', isLoggedIn, function(req, res){
    // setting up searchSettingHash, which stores the search criteria from the user
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
		if (req.body.category == "All")
		 	 searchSettingHash["category"] = ["Mustard", "Ketchup", "Relish", null];
		else
			searchSettingHash["category"] = req.body.category.split(",");
 		searchSettingHash["sortBy"] = req.body.sortBy; searchSettingHash["sortOrder"] = req.body.sortOrder;
		if (searchSettingHash["sortBy"] == "suggested")
			searchSettingHash["sortBy"] = "updateTime";
		if (searchSettingHash["sortOrder"] == "default")
			if ((searchSettingHash["sortBy"] == "updateTime") || (searchSettingHash["sortBy"] == "userRating"))
				searchSettingHash["sortOrder"] = "descending";
			else
				searchSettingHash["sortOrder"] = "ascending";
		else //reverse order
			if ((searchSettingHash["sortBy"] == "updateTime") || (searchSettingHash["sortBy"] == "userRating"))
				searchSettingHash["sortOrder"] = "ascending";
			else
				searchSettingHash["sortOrder"] = "descending";
		searchSettingHash["lowCost"] = (req.body.lowCost == "")? 0 : req.body.lowCost;
		searchSettingHash["highCost"]  = (req.body.highCost == "")? 99999999 : req.body.highCost;
    console.log("POST: "); console.log(searchSettingHash);

    var publicPlan = [];
    Plan.find({private: false}).exec(function(err, plans){
      // ids of public plans are store
      for (var i=0; i < plans.length; i++)
        publicPlan.push(plans[i]._id);
      Activity
      .count({
        // use the ids of the public plans to search public activity
        planID: {$in: publicPlan},
        activitySub: new RegExp(searchSettingHash["name"], 'i'),
        updateTime: {
          $gte: searchSettingHash["searchStart"],
          $lte: searchSettingHash["searchEnd"]
        },
        activityCat: {$in: searchSettingHash["category"] },
        activityCost: {
          $gte: searchSettingHash["lowCost"] ,
          $lte: searchSettingHash["highCost"]
        }
      }, function(err, c){
        Activity
        .find({
          planID: {$in: publicPlan},
          activitySub: new RegExp(searchSettingHash["name"], 'i'),
          updateTime: {
            $gte: searchSettingHash["searchStart"],
            $lte: searchSettingHash["searchEnd"]
          },
    			activityCat: {$in: searchSettingHash["category"] },
    			activityCost: {
    				$gte: searchSettingHash["lowCost"] ,
    				$lte: searchSettingHash["highCost"]
    			}
        })
    		.sort({[searchSettingHash["sortBy"] ]: [searchSettingHash["sortOrder"] ]})
        .skip(20*(req.body.nextPage-1)).limit(20)
    		.populate({
    			path: 'planID',
          populate: {path: "userID"}})
        .exec(function(err, acts){
          console.log("c = ", c, "maxP  = ", Math.ceil(c/20.0))
  	      if (req.body.sortBy == "suggested")
  	        searchSettingHash["sortBy"] = "suggested";
  	      searchSettingHash["sortOrder"] = req.body.sortOrder;
  	      res.render('activityList.ejs', {
  	        listOfAct: acts,
  					currentPage: req.body.nextPage,
            // check if there are at least 2 pages before and after the desired page
  	        minP: Math.max(parseInt(req.body.nextPage) - 2, 1),
            maxP: Math.ceil(c/20.0),
  	        searchSettingHash: searchSettingHash
  				});
        });
      });
    });
  });
	router.get('/userList', isLoggedIn, function(req, res){
    // by default no date display
    // this is to protect privacy
    var searchSettingHash = {};
		searchSettingHash["name"] = "";
		var users = [];
		res.render('userList.ejs', {
	    listOfUser: users,
	    searchSettingHash: searchSettingHash,
		});
  });
	router.post('/userList', isLoggedIn, function(req, res){
		var searchSettingHash = {};
		searchSettingHash["name"] = req.body.name;
		User.find({"local.username": req.body.name})
		.exec(function(err, users){
			console.log("Users: ", users);
			var userID = []
			var plans = {};
			for (var i = 0; i < users.length; i++){
        // ids of user with the same username are stored
				userID.push(users[i]._id);
				plans[users[i]._id] = [];
			}
      // plans owned by these users are retrieved
			Plan.find({userID: {$in: userID}, private: false}).exec(function(err, p){
				for (var i = 0; i < p.length; i++){
					plans[p[i].userID].push(p[i]);
				}
				console.log("Users: ", userID);
				console.log("Plans: ", plans);
				res.render('userList.ejs', {
					listOfUser: users,
					listOfPlan: plans,
					searchSettingHash: searchSettingHash
				});
			});
		});
	});
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =====================================
// googleMap ==============================
// =====================================
	app.get('/googleMap', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('googleMap.ejs',{ title: 'Add New User' });
	});
// =====================================
// upload profile ==============================
// =====================================
	var upload=require('./upload');

	app.get('/upload',isLoggedIn, function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('upload.ejs',{ message: 'upload profile picture' });
	});

	app.post('/upload',upload.single('avatar'), function(req, res, next){
		//console.log("here2+"+req.user.local.username);

		if(req.file){
			//req.user.local.image=
			//res.send('upload successfully');
			console.log(req.file);
			console.log(req.body);
			res.render('upload.ejs',{ message: 'upload successful'});
		}
	});

//======================================
//Brian start===========================
//======================================
	router.get('/createplan',isLoggedIn,controller.createplan);
	router.post('/createplan',isLoggedIn, controller.createplan);
	router.get('/userplanslist',isLoggedIn, controller.userplanslist);
	router.get('/plans/:planId',isLoggedIn,controller.findPlanById);
	router.post('/plans/:planId',isLoggedIn,controller.updateplan);
	router.get('/plandelete/:planId',isLoggedIn,controller.deleteplan);

  var multer = require('multer');
  var Actstorage = multer.diskStorage({
      destination: function(req, file, cb) {
          cb(null, 'public/images/activity');
      },
      filename: function(req, file, cb) {
          cb(null, Date.now() + '_' + file.originalname);
      }
  })
  var uploadact = multer({
      storage: Actstorage
  })
  router.post('/plans/:planId/uploadActivityImg', uploadact.single('file'), Actimgcontroller.uploadphoto);
	//======================================
	//Brian end=============================
	//======================================


	//======================================
	//Alvin start===========================
	//======================================
	// createActivity()
	app.get('/plans/:planId/createActivity', isLoggedIn, function(req, res) {
		var planid= req.params.planId;
		res.render('createActivity.ejs', {
				planid:planid,
			message: req.flash('createActivityMessage')
		});
	});

	app.post('/plans/:planId/createactivity', function(req, res) {
		var planid= req.params.planId;
		var activity = new Activity();
		var user = req.user;
		activity.planID = planid;
	  activity.activitySub = req.body.activitySub;
	  activity.activityContent = req.body.activityContent;
		activity.activityTime = req.body.activityTime;
		activity.activityLoc = req.body.activityLoc;
	  activity.activityCost = req.body.activityCost;
		activity.activityCat = req.body.activityCat;
	  activity.userRating = req.body.userRating;
		activity.publicRating = 0;
		activity.ratingTotal = 0;
	  console.log(activity);

	  activity.save(function(err){
	    console.log(err);
			res.redirect('/plans/' + planid + '');
	  })
	});

	app.get('/plans/:planId/viewActivity', isLoggedIn, function(req, res) {
		var user = req.user;
		var planid= req.params.planId;
		Activity.find({planID: planid}, function(err, activity){
			console.log(activity);
			res.render('viewActivity.ejs', {
				activity : activity
			});
		});
	});

	// updateActivity()
	app.get('/plans/:planId/updateActivity/:activityID', isLoggedIn, function(req, res) {
		var planid= req.params.planId;
		var activityid = req.params.activityID;
		Activity.findOne({_id:activityid},function(err,activity){
			res.render('updateActivity.ejs', {
				planid:planid,
				activity : activity,
				message: req.flash('signupMessage')
			});
		});
	});

	app.post('/plans/:planId/updateActivity/:activityID', isLoggedIn, function(req, res) {
		console.log("update activity");
		var planid=req.params.planId;
		var activityid = req.params.activityID;
		Activity.findOne({_id:activityid},function(err,activity){
			if(!activity){
				res.send("There was a problem adding the information to the database.");
			}else{
			  activity.activitySub = req.body.activitySub;
				activity.activityContent = req.body.activityContent;
				activity.activityTime = req.body.activityTime;
			  activity.activityCost = req.body.activityCost;
		activity.activityCat = req.body.activityCat;
			  activity.userRating = req.body.userRating;
// save detail
				activity.save(function(err) {
						if (err)
							console.log('error')
						else{
							console.log("Success");
							res.location('/plans/' + planid );
							res.redirect('/plans/' + planid );
						}
				});
			}
		})
	});

	// delActivity()
	app.get('/plans/:planId/delActivity/:activityID', isLoggedIn, function(req, res) {
		var activityid = req.params.activityID;
		var planid=req.params.planId;
		Activity.findOneAndRemove({_id:activityid},function(err){
			comment.remove({activityID:activityid},function(err){
			if(err) console.log("Cannot delete!")
			else{
				console.log("Success");
				res.location('/plans/' + planid);
				res.redirect('/plans/' + planid);
			}
		});
		});
	});

	//======================================
	//Alvin end=============================
	//======================================

  //======================================
	//John start===========================
	//======================================
	app.post('/plans/:planId/comment', isLoggedIn, function(req, res) {
		var planid=req.params.planId;
		var comments = req.body.comments;
	  var date = new Date();
	  var activtyID = req.body.activityID;
		var user = req.user;
		Activity.findOne({_id:activtyID},function(err,activity){
			if(!activity){
				res.send("There was a problem adding the information to the database.");
			}else{
			  activity.publicRating = parseInt(activity.publicRating) + parseInt(req.body.star);
				activity.ratingTotal =  parseInt(activity.ratingTotal) + parseInt(1);
				// save detail
								activity.save(function(err) {
										if (err)
											console.log('error')
										else{
											console.log("PublicRating:");
											console.log(activity.publicRating);
										}
								});

			}
		})
		console.log("comments:");
		console.log(comments);
		console.log(activtyID);

		var addComments = new comment({
	    comments : comments,
	    date : date,
	    activityID : activtyID,
			userID: user.id
	  });
		console.log(addComments);
		addComments.save(function(err) {
				if (err){
					res.json(500, {'error': err});
				} else {
					console.log("Success");
					res.location('/plans/' + planid + '/#' + activtyID);
					res.redirect('/plans/' + planid + '/#' + activtyID);
				}
		});
	});

	//======================================
	//Jonh end=============================
	//======================================

	app.use('/', router);
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function getPage(){
	// Plan.find({private: false}).exec(function(err, plans){
	// 	var array = plans.map{|x| x[_id]};
	// 	console.log(array);
	// });
	return 10;
}
