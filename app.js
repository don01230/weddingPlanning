var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


//var index = require('./routes/index');

//var about = require('./routes/about');
//var register = require('./routes/register');
//var registerSuccessfully = require('./routes/registerSuccessfully');
//var login = require('./routes/login');
//var userlist  = require('./routes/userlist');
//var adduser  = require('./routes/adduser');
//var todo   = require('./routes/todo');
//var pn = require('./routes/plans');

var app = express();

var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var session      = require('express-session');

// Connect to MongoDB
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Database Connected.");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));

app.use(session({
    secret: 'cookie_secret',
    name: 'cookie_name',

    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); 										// 紀錄 session
app.use(flash()); 													// 回饋訊息處理


// Allow router to access db
app.use(function(req,res,next){
    req.db = db;
    next();
});

//app.get('/about',about);
//app.get('/register',register);
//app.post('/register',register);
//app.get('/registerSuccessfully',registerSuccessfully);
//app.get('/login',login);
//app.post('/login',login);
//app.get('/userlist',userlist);
//app.post('/userlist',userlist);
//app.get('/adduser',adduser);
//app.post('/adduser',adduser);
//app.get('/todo',todo);
//app.post('/todo',todo);
require('./routes/routes.js')(app,passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
