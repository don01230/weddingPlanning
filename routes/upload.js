//reference source:
//https://cnodejs.org/topic/5721cd79fa48138c41110f05

var multer = require('multer');
var md5 = require('md5');
var config = require('./config.js')
//upload profile picture
var storage = multer.diskStorage({

    destination: config.upload.path,

    filename: function (req, file, cb) {
      console.log("here2+"+req.user.local.email);

        var fileFormat =(file.originalname).split(".");
        cb(null, req.user.local.email + "." + fileFormat[fileFormat.length - 1]);
        req.user.local.image=req.user.local.email + "." + fileFormat[fileFormat.length - 1];
        req.user.save(function(err){
          if(err){
            console.log("err");
          }else{
            console.log("success");
          }
        });
    }
});

var upload = multer({
    storage: storage,

});

module.exports = upload;
