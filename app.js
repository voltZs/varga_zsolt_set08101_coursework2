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




//==============================================================================
//=============================== GET ROUTES ===================================
//==============================================================================
//this one is the about page basically
app.get("/", function(req, res){
  res.render("index");
})

//user gets here after logging in!
app.get("/welcome", loggedIn, function(req,res){
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-1);

  var limitPop;
  if(req.query.limitPop == undefined){
    limitPop = 3;
  } else {
    limitPop = parseInt(req.query.limitPop);
  }
  var limitRec;
  if(req.query.limitRec == undefined){
    limitRec = 3;
  } else {
    limitRec = parseInt(req.query.limitRec);
  }

  Group.find({_id: {$in: req.user.groups}}, function(err, foundGroups){
    if(err){
      console.log(err);
    } else {
      var ventIDs = [];
      for(var i =0; i<foundGroups.length; i++){
        for(var j = 0; j<foundGroups[i].vents.length; j++){
          ventIDs.push(foundGroups[i].vents[j]);
        }
      }
      Vent.find({_id: {$in: ventIDs}}).where('date')
      .gt(yesterday).sort('-favourited').limit(limitPop)
      .exec(function(err, foundVents1){
        if(err){
          console.log(err);
        } else {
          Vent.find({_id: {$in: ventIDs}}).sort('-date').limit(limitRec).exec(function(err, foundVents2){
            if(err){
              console.log(err);
            } else {
              res.render("landing", {
                popularVents: foundVents1,
                recentVents: foundVents2,
                limitPop: limitPop,
                limitRec: limitRec
              });
            }
          })
        }
      })
    }
  })
})

app.get("/groups", loggedIn, function(req, res){
  var searchWord= req.query.search;
  Group.find({}, function(err, foundGroups){
    if(err){
      console.log(err);
    } else {
      var groups = [];
      for(var i=0; i<foundGroups.length; i++){
        if(searchWord != ""){
          if(foundGroups[i].name.includes(searchWord)
          || compareKeywords(searchWord, foundGroups[i].keywords)){
            groups.push(foundGroups[i]);
          }
        }
      }
      res.render("searchGroups", {matchedGroups: groups, currentSearch: searchWord})
    }
  })
})

app.get("/groups/new", loggedIn, function(req,res){
  res.render("newGroup");
})

app.get("/groups/:groupID", loggedIn, function(req, res){
  var groupID = req.params.groupID;
  var sortIndex = req.query.sorting;
  if(sortIndex == undefined || sortIndex>2){
    sortIndex = 0;
  }

  var sorting;
  switch(parseInt(sortIndex)){
    case 0:
      sorting = '-date'; //newest first - descending
      break;
    case 1:
      sorting = 'date'; //oldest first - ascending
      break;
    case 2:
      sorting = '-favourited'; //most favourited first - descending
      break;
  }

  Group.findById(groupID).populate("vents").exec(function(err, foundGroup){
    if(err){
      console.log(err);
      res.render("userError", {msg: "Sorry, that group does not exist or was removed."});
    } else {
      Vent.find({_id: {$in: foundGroup.vents}}).sort(sorting).exec(function(err, foundVents){
        if(err){
          console.log(err);
        } else {
          res.render("insideAGroup", {
            ventGroup: foundGroup,
            VDisplay: foundVents,//uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name
            sortIndex: sortIndex});
        }
      })
    }
  })

})

app.get("/groups/:groupID/edit", loggedIn, function(req, res){
  var groupID = req.params.groupID;
  Group.find({}, function(err){
    if(err){
      console.log(err);
    } else {
      Group.findById(groupID, function(err, foundGroup){
        //check if logged in user is admin, fi not redirect!
        if(String(req.user._id) == String(foundGroup.creator)){
          res.render("editGroup", {
            ventGroup: foundGroup
          })
        } else {
          res.render("userError", {
            msg: "You do not have permission to edit this group"
          })
        }
      })
    }
  })
})

app.get("/groups/:groupID/follow", loggedIn, function(req, res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
    } else {
      User.findById(req.user._id, function(err, foundUser){
        if(err){
          console.log(err);
        } else {
          foundUser.groups.push(foundGroup);
          foundUser.save(function(err){
            if(err){
              console.log(err);
            }
          })
          res.redirect('back');
        }
      })
    }
  })
})

app.get("/groups/:groupID/unfollow", loggedIn, function(req, res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
    } else {
      User.findById(req.user._id, function(err, foundUser){
        if(err){
          console.log(err);
        } else {
          foundUser.groups.pull({_id : foundGroup._id});
          foundUser.save(function(err){
            if(err){
              console.log(err);
            }
          })
          res.redirect('back');
        }
      })
    }
  })
})

app.get("/saved", loggedIn, function(req, res){

  User.findById(req.user._id).populate("saved").exec(
    function(err, foundUser){
      if(err){
        console.log(err);
      } else {

        res.render("insideSaved", {
          VDisplay: foundUser.saved   //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name, must be an array
        });
      }
    }
  )
})

app.get("/originals", loggedIn, function(req, res){
  User.findById(req.user._id, function(err, foundUser){
      if(err){
        console.log(err);
      } else {
        Vent.find({_id: {$in: foundUser.vents}}).sort('-date')
        .exec(function(err, foundVents){
          if(err){
            console.log(err);
          } else {
            res.render("insideOriginals", {
              VDisplay: foundVents   //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name, must be an array
            });
          }
        })
      }
    }
  )
})

app.get("/groups/:groupID/vent/new", loggedIn, function(req,res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
      res.render("userError", {msg: "Sorry, that group does not exist or was removed."});
    } else {
      res.render("newVent", {ventGroup: foundGroup})
    }
  });
})

app.get("/vent/:ventID", loggedIn, function(req,res){
  var ventID = req.params.ventID;

  Vent.findById(ventID).populate({path: "comments", populate: {path: "user"}}).exec(
    function(err, foundVent){
      if(err){
        console.log(err);
        res.render("userError", {msg: "Sorry, that vent does not exist or was removed."});
      } else {
        res.render("vent", {
          foundVent: foundVent,
          VDisplay: [foundVent]
        })
      }
    }
  )
})

app.get("/vent/:ventID/edit", loggedIn, function(req, res){
  var ventID = req.params.ventID;

  Vent.findById(ventID, function(err, foundVent){
    if(err){
      res.render("userError", {msg: "Sorry, we are having trouble retrieving that vent."});
    } else {
      res.render("editVent", {
        foundVent: foundVent})
    }
  })

})

app.get("/saved/:ventID/add", loggedIn, function(req, res){
  var ventID = req.params.ventID
  //Find the vent by the id passed in the parameter
  Vent.findById(ventID, function(err, foundVent){
      if(err){
        console.log(err);
        res.render("userError", {msg: "Sorry, we are having trouble retrieving that vent."});
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
        res.render("userError", {msg:"Sorry, we are having trouble retrieving that vent."});
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
    res.render("userError", {msg: "Seems like you took the wrong turn. There's nothing here"})
  } else {
    res.render("nonUserError", {msg: "Seems like you took the wrong turn. There's nothing here."});
  }
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
  User.register(new User({
        username: req.body.username,
        email: req.body.email,
        }),
      req.body.password,
      function(err, savedUser){
        if(err){
          console.log(err);
          return res.render('/register');
        } else {
          passport.authenticate('local')(req, res, function(){
            Group.findOne({name: "VentTeam"}, function(err, foundGroup){
              savedUser.groups.push(foundGroup._id);
              savedUser.save(function(err){
                if(err){
                  console.log(err);
                } else {
                  res.redirect("/welcome");
                }
              })
            })
          });
        }
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

app.put("/groups/:groupID", loggedIn, function(req, res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
    } else {
      var keywords = keywordsIntoArray(req.body.keywords);
      for(var i=0; i<keywords.length; i++){
        foundGroup.keywords.push(keywords[i]);
      }
      foundGroup.save(function(err){
        if(err){
          console.log(err);
        }
      })
    }
  })

  Group.findByIdAndUpdate(groupID,{
    name: req.body.name,
    description: req.body.description},
    function(err, savedGroup){
      if(err){
        console.log(err);
      } else {
        res.redirect("/groups/" + savedGroup._id)
      }
    })
})

//==============================================================================
//============================== DELETE ROUTES =================================
//==============================================================================

//removing a vent also deletes all comments associated with it
app.delete("/vent/:ventID", loggedIn, function(req, res){
  var ventID = req.params.ventID
  //find vent - remove comments with id in vent.comments array of ids
  Vent.findById(ventID, function(err, foundVent){
    if(err){
      console.log(err);
      res.redirect("/vent/"+ ventID +"/edit");
    } else {
      VComment.remove({_id: {$in: foundVent.comments}}, function(err){
        if(err){
          console.log(err);
          res.redirect("/vent/"+ ventID +"/edit");
        } else {
          Vent.findByIdAndRemove(foundVent._id, function(err){
            if(err){
              console.log(err);
              res.redirect("/vent/"+ ventID +"/edit");
            } else {
              res.redirect("/originals");
            }
          })
        }
      })
    }
  })

})

//when deleting a group, the vents posted to it do not get removed!
app.delete("/groups/:groupID", loggedIn, function(req, res){
  var groupID = req.params.groupID
  Group.findByIdAndRemove(groupID, function(err){
    if(err){
      console.log(err);
      res.redirect("/groups/"+ groupID +"/edit");
    } else {
      res.redirect("/welcome");
    }
  })
})


//middleware to check if user is logged in - if not, redirect to login ROUTE
function loggedIn(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect("/login");
  }
}

//turn string of keywords separated by commas or commas with a space to array of keywords
function keywordsIntoArray(stringOfKeywords){
  var stringOfKW = stringOfKeywords;
  var arrayOfKW = stringOfKW.split(', ').join(',').split(',')
  return arrayOfKW
}

//checks if any of the keywords array contains the searchString (even as a substring)
function compareKeywords(searchString, keyWordsArray){
  for(var i=0; i<keyWordsArray.length; i++){
    if(keyWordsArray[i].includes(searchString)){
      return true
    }
  }
  return false
}

//==============LISTEN ON PORT 3000=======================
app.listen(3000, function(){
    console.log("Server listening on port 3000");
})
