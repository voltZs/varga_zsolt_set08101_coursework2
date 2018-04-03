//INITIAL SETUP

var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    expressesh = require("express-session"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    methodOverride = require("method-override");

var getRoutes = require("./routes/getRoutes"),
    postRoutes = require("./routes/postRoutes"),
    putRoutes = require("./routes/putRoutes"),
    deleteRoutes = require("./routes/deleteRoutes");

mongoose.connect('mongodb://localhost/vent_db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected.");
});

var User     = require("./models/user");
var Group    = require("./models/group");
var Vent     = require("./models/vent");
var VComment = require("./models/comment");


app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressesh({
  secret: "Venting makes your life easier",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method")); //tells app take this string as paramater  and when it’s present override it

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//every route should pass the currently loggen in user in
//also the logged in user's followed groups for the sidebar (allGroups) AND the groups the user created
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  if(req.user){
    Group.find({_id: {$in: req.user.groups}}, function(err, followedGroups){
      if(err){
        console.log(err);
      } else {
        Group.find({creator: req.user._id}, function(err, myGroups){
          if(err){
            console.log(err);
          } else {
            res.locals.allFollowed = followedGroups;
            res.locals.allMine = myGroups;
            next();
          }
        })
      }
    })
  } else {
    res.locals.allGroups = null;
    res.locals.allMine = null;
    next();
  }
})

app.use("/", getRoutes);
app.use("/", postRoutes);
app.use("/", putRoutes);
app.use("/", deleteRoutes);

//==============LISTEN ON PORT 3000=======================
app.listen(3000, function(){
    console.log("Server listening on port 3000");
})
