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

var seedDB = require("./seedDB");
seedDB();


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
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
})



//==============================================================================
//=============================== GET ROUTES ===================================
//==============================================================================
//this one is the about page basically
app.get("/", function(req, res){
  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      res.render("index", {allGroups: allGroups});
    }
  });
})

//user gets here after logging in!
app.get("/welcome", loggedIn, function(req,res){
  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      res.render("landing", {allGroups: allGroups});
    }
  });
})

app.get("/groups", loggedIn, function(req, res){
  res.render("manageGroups");
})

app.get("/groups/new", loggedIn, function(req,res){
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
          res.render("insideAGroup", {
            allGroups: allGroups,
            ventGroup: foundGroup,
            VDisplay: foundGroup.vents});   //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name
        }
      });

    }
  });

})

app.get("/groups/:groupID/edit", loggedIn, function(req, res){
  var groupID = req.params.groupID;
  Group.find({}, function(err, allGroups){
    if(err){
      console.log(err);
    } else {
      Group.findById(groupID, function(err, foundGroup){
        //check if logged in user is admin, fi not redirect!
        if(String(req.user._id) == String(foundGroup.creator)){
          res.render("editGroup", {
            allGroups: allGroups,
            ventGroup: foundGroup
          })
        } else {
          render("userError", {msg: "You do not have permission to edit this group", allGroups: allGroups})
        }
      })
    }
  })
})

app.get("/saved", loggedIn, function(req, res){

  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      User.findById(req.user._id).populate("vents").populate("saved").exec(
        function(err, foundUser){
          if(err){
            console.log(err);
          } else {
            res.render("insideSaved", {
              allGroups: allGroups,
              VDisplay: foundUser.saved   //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name, must be an array
            });
          }
        }
      )
    }
  })
})

app.get("/originals", loggedIn, function(req, res){
  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      User.findById(req.user._id).populate("vents").populate("saved").exec(
        function(err, foundUser){
          if(err){
            console.log(err);
          } else {
            res.render("insideOriginals", {
              allGroups: allGroups,
              VDisplay: foundUser.vents})  //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name, must be an array
          }
        }
      )
    }
  })
})

app.get("/groups/:groupID/vent/new", loggedIn, function(req,res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
      res.render("notFound");
    } else {
      Group.find({}, function(err, allGroups){
        if(err){
          console.console.log(err);
        } else {
          res.render("newVent", {
            ventGroup: foundGroup,
            allGroups: allGroups})
        }
      })
    }
  });
})

app.get("/vent/:ventID", loggedIn, function(req,res){
  var ventID = req.params.ventID;

  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      Vent.findById(ventID).populate({path: "comments", populate: {path: "user"}}).exec(
        function(err, foundVent){
          if(err){
            console.log(err);
          } else {
            res.render("vent", {
              allGroups: allGroups,
              foundVent: foundVent,
              VDisplay: [foundVent]})
          }
        }
      )
    }
  });
})

app.get("/vent/:ventID/edit", loggedIn, function(req, res){
  var ventID = req.params.ventID;

  Group.find({}, function(err, allGroups){
    if(err){
      console.console.log(err);
    } else {
      Vent.findById(ventID, function(err, foundVent){
        if(err){
          console.log(err);
        } else {
          res.render("editVent", {
            allGroups: allGroups,
            foundVent: foundVent})
        }
      })
    }
  });
})

app.get("/saved/:ventID/add", loggedIn, function(req, res){
  var ventID = req.params.ventID
  //Find the vent by the id passed in the parameter
  Vent.findById(ventID, function(err, foundVent){
      if(err){
        console.log(err);
      } else {
        //Find user by user id of the person logged in
        User.findById(req.user._id, function(err, foundUser){
          if(err){
            console.log(err);
          } else {
            //Check if logged in user already has the vent saved, if not, save it
            var savedIDs = [];
            for(var i=0; i<req.user.saved.length; i++){
              savedIDs.push(String(req.user.saved[i]));
            }
            if(!savedIDs.includes(String(foundVent._id))){
              foundUser.saved.push(foundVent);
              foundUser.save(function(err){
                if(err){
                  console.log(err);
                } else {
                  //increase the favourite count of vent
                  Vent.findByIdAndUpdate(foundVent._id,
                    {favourited: (foundVent.favourited)+1},
                    function(err, updatedVent){
                      if(err){
                        console.log(err);
                      }
                  })
                }
              })
            }
            res.redirect('back');
          }
        })
      }
    }
  )
})

app.get("/saved/:ventID/remove", loggedIn, function(req, res){
  var ventID = req.params.ventID
  //Find the vent by the id passed in the parameter
  Vent.findById(ventID, function(err, foundVent){
      if(err){
        console.log(err);
      } else {
        //Find user by user id of the person logged in
        User.findById(req.user._id, function(err, foundUser){
          if(err){
            console.log(err);
          } else {
              foundUser.saved.pull({_id: foundVent._id});
              foundUser.save(function(err){
                if(err){
                  console.log(err);
                } else {
                  //increase the favourite count of vent
                  Vent.findByIdAndUpdate(foundVent._id,
                    {favourited: (foundVent.favourited)-1},
                    function(err, updatedVent){
                      if(err){
                        console.log(err);
                      }
                  })
                }
              })
            res.redirect('back');
          }
        })
      }
    }
  )
})

app.get("/login", function(req,res){
  res.render("login");
})

app.get("/register", function(req,res){
  res.render("register");
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})

app.get("*", function(req,res){
  if(req.isAuthenticated()){
    res.render("userError", {msg: "There's nothing here"});
  }
  res.render("nonUserError", {msg: "There's nothing here"});
})




//==============================================================================
//=============================== POST ROUTES ==================================
//==============================================================================

app.post("/groups", loggedIn, function(req, res){
  if(req.body.name != "" && req.body.description != ""){
    Group.create({
      name: req.body.name,
      description: req.body.description,
      keywords: keywordsIntoArray(req.body.keywords),
      creator: req.user
    }, function(err, savedGroup){
      if(err){
        console.log(err);
      } else {
        console.log("DB added group: " + savedGroup);
        res.redirect("/groups/" + savedGroup._id);
      }
    })
  } else {
    res.redirect("/groups/new");
  }
})

app.post("/groups/:groupID/vent", loggedIn, function(req, res){
  var groupID = req.params.groupID;

  if(req.body.category != "" && req.body.content != ""){
    Vent.create(req.body, function(err, savedVent){
        if(err){
          console.log(err);
        } else {
          console.log("DB added vent:" + savedVent);
          //push vent into group's vents array
          Group.findById(groupID, function(err, foundGroup){
            if(err){
              console.log(err);
            } else {
              foundGroup.vents.push(savedVent);
              foundGroup.save(function(err){
                if(err){
                  console.log(err);
                } else {
                  console.log("...to group: " + foundGroup._id);
                  // push vent into user
                  //change this to current;y logged in user when that's implemented
                  User.findById(req.user._id, function(err, foundUser){
                    if(err){
                      console.log(err);
                    } else {
                      foundUser.vents.push(savedVent);
                      foundUser.save(function(err){
                        if(err){
                          console.log(err);
                        } else {
                          console.log("...to user: " + foundUser._id);
                          res.redirect("/vent/" + savedVent._id)
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
  } else {
    res.redirect("/groups/"+ groupID +"/vent/new");
  }
})

app.post("/vent/:ventID/comment", loggedIn, function(req, res){
  var groupID = req.params.groupID;
  var ventID = req.params.ventID;

  //CHANGE THIS TO THE CURRENTLY LOGGED IN USER !!!!!!!!!
  User.findById(req.user._id, function(err, foundCommenter){
    if(err){
      console.log(err);
    }else{
      if(req.body.content != ""){
        VComment.create({
            content: req.body.content,
            user: foundCommenter._id
          },
          function(err, savedComment){
            if(err){
              console.log(err);
            } else {
              //find vent and push comment into it
              Vent.findById(ventID, function(err, foundVent){
                if(err){
                  console.log(err);
                } else {
                  foundVent.comments.push(savedComment);
                  foundVent.save(function(err){
                    if(err){
                      console.log(err);
                    } else {
                      console.log("DB added Vcomment: " + savedComment);
                      console.log("...to vent ID: " + foundVent._id);
                      res.redirect("/vent/" + ventID);
                    }
                  })
                }
              })
            }
          }
        )
      } else {
        res.redirect("/vent/" + ventID);
      }
    }
  })
})


app.post("/login", passport.authenticate("local", {
  successRedirect: "/welcome",
  failureRedirect: "/login"
}),function(req, res){
})


app.post("/register", function(req, res){
  User.register(new User({username: req.body.username, email: req.body.email}),
      req.body.password,
      function(err, savedUser){
        if(err){
          console.log(err);
          return res.render('/register');
        }
        passport.authenticate('local')(req, res, function(){
          res.redirect("/welcome");
        });
      })
})

//==============================================================================
//================================ PUT ROUTES ==================================
//==============================================================================

app.put("/vent/:ventID", loggedIn, function(req, res){
  var ventID = req.params.ventID;

  Vent.findByIdAndUpdate(ventID,
    {category: req.body.category, content: req.body.content},
    function(err, savedVent){
      if(err){
        console.log(err);
      } else {
        res.redirect("/vent/" + savedVent._id)
      }
    })
})

//==============================================================================
//============================== DELETE ROUTES =================================
//==============================================================================

app.delete("/vent/:ventID", loggedIn, function(req, res){
  var ventID = req.params.ventID
  Vent.findByIdAndRemove(ventID, function(err){
    if(err){
      console.log(err);
      res.redirect("/vent/"+ ventID +"/edit");
    } else {
      res.redirect("/originals");
    }
  })
})


// //middleware to check if user is logged in - if not, redirect to login ROUTE
// function loggedIn(req, res, next){
//   if(req.isAuthenticated()){
//     next();
//   } else {
//     res.redirect("/login");
//   }
// }
//
// //turn string of keywords separated by commas or commas with a space to array of keywords
// function keywordsIntoArray(stringOfKeywords){
//   var stringOfKW = stringOfKeywords;
//   var arrayOfKW = stringOfKW.split(', ').join(',').split(',')
//   return arrayOfKW
// }

//==============LISTEN ON PORT 3000=======================
app.listen(3000, function(){
    console.log("Server listening on port 3000");
})
