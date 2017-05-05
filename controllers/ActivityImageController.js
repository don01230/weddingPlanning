var Image = require('../models/Image');

//function for saving the activity image
exports.uploadphoto = function(req, res, next) {
    var user = req.user;//get user jason
    var planid = req.params.planId;
    var image = new Image();
    console.log("Enter UploadPhoto Post");
    console.log(req.file);
    console.log(req.body);
    image.activityID=req.body.activityID;
    image.imageName= req.file.filename;

    image.path = req.file.path;
    image.save(function(err) {
        res.send(200);
    })
}
