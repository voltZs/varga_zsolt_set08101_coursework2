//INITIAL SETUP

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");
//
// mongoose.connect('mongodb://localhost/vent_db');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("Database connected.");
// });

app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));

//======================  GET ROUTES ============================
//this one is the about page basically
app.get("/", function(req, res){
  res.render("index");
});

app.get("/groups", function(req, res){
  res.render("manageGroups");
});

app.get("/groups/newgroup", function(req,res){
  res.render("newGroup");
});

app.get("/groups/:groupID", function(req, res){
  res.render("insideAGroup");
});

app.get("/login", function(req,res){
  res.render("login");
})

app.get("/register", function(req,res){
  res.render("register");
})

//user gets here after logging in!
app.get("/landing", function(req,res){
  res.render("landing");
})

app.get("/newpost", function(req,res){
  res.render("newPost");
});

app.get("*", function(req,res){
  res.render("notFound");
});






//==============LISTEN ON PORT 3000=======================
app.listen(3000, function(){
    console.log("Server listening on port 3000");
});
