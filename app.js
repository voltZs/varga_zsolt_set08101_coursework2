//INITIAL SETUP

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/vent_db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database connected.");
});

var User = require("./models/user");
var Group = require("./models/group");
var Vent = require("./models/vent");
var VComment = require("./models/comment");

var seedDB = require("./seedDB");
seedDB();


app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));



//=========================================================
//===================== GET ROUTES ========================
//=========================================================
//this one is the about page basically
app.get("/", function(req, res){
  res.render("index");
})


app.get("/groups", function(req, res){
  res.render("manageGroups");
})

app.get("/groups/new", function(req,res){
  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      res.render("newGroup", {allGroups: allGroups});
    }
  });
})

app.get("/groups/:groupID", function(req, res){
  var groupID = req.params.groupID;

  Group.findById(groupID).populate("vents").exec(function(err, foundGroup){
    if(err){
      console.log(err);
      res.render("notFound");
    } else {
      Group.find({}, function(err, allGroups){
        if(err){
          console.console.log(err);
        } else {
          res.render("insideAGroup", {ventGroup: foundGroup, allGroups: allGroups});
        }
      });

    }
  });

})

app.get("/saved", function(req, res){
  res.render("insideSaved");
})

app.get("/originals", function(req, res){
  res.render("insideOriginals");
})

app.get("/login", function(req,res){
  res.render("login");
})

app.get("/register", function(req,res){
  res.render("register");
})
//user gets here after logging in!
app.get("/welcome", function(req,res){
  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      res.render("landing", {allGroups: allGroups});
    }
  });
})

app.get("/groups/:groupID/vent/new", function(req,res){
  var groupID = req.params.groupID;

  Group.findById(groupID).populate("vents").exec(function(err, foundGroup){
    if(err){
      console.log(err);
      res.render("notFound");
    } else {
      Group.find({}, function(err, allGroups){
        if(err){
          console.console.log(err);
        } else {
          res.render("newVent", {ventGroup: foundGroup, allGroups: allGroups});
        }
      })
    }
  });
})

app.get("/groups/:groupID/vent/:ventID", function(req,res){
  res.render("vent.ejs");
})

app.get("*", function(req,res){
  res.render("notFound");
})




//=========================================================
//==================== POST ROUTES ========================
//=========================================================

app.post("/groups", function(req, res){
  if(req.body.name != "" && req.body.description != ""){
    Group.create(req.body, function(err, savedGroup){
      if(err){
        console.log(err);
      } else {
        res.redirect("/groups/" + savedGroup._id);
      }
    })
  } else {
    res.redirect("/groups/new");
  }
})

app.post("/vent", function(req, res){
  console.log(req.body);
  console.log(req.params.category);
  res.redirect("/welcome")
})




//==============LISTEN ON PORT 3000=======================
app.listen(3000, function(){
    console.log("Server listening on port 3000");
})
