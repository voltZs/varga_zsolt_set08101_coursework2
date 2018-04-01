var express = require("express");
var router  = express.Router();
var functions = require("../functions");
var User     = require("../models/user");
var Group    = require("../models/group");
var Vent     = require("../models/vent");

router.get("/", function(req, res){
  res.render("index/index");
})

//user gets here after logging in!
router.get("/welcome", functions.loggedIn, function(req,res){
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
              res.render("index/landing", {
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

router.get("/groups/search", functions.loggedIn, function(req, res){
  var searchWord= req.query.search;
  Group.find({}, function(err, foundGroups){
    if(err){
      console.log(err);
    } else {
      var groups = [];
      for(var i=0; i<foundGroups.length; i++){
        if(searchWord != ""){
          if(foundGroups[i].name.includes(searchWord)
          || functions.compareKeywords(searchWord, foundGroups[i].keywords)){
            groups.push(foundGroups[i]);
          }
        }
      }
      res.render("groups/searchGroups", {matchedGroups: groups, currentSearch: searchWord})
    }
  })
})

router.get("/groups/new", functions.loggedIn, function(req,res){
  res.render("groups/newGroup");
})

router.get("/groups/:groupID", functions.loggedIn, function(req, res){
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
      res.render("index/userError", {msg: "Sorry, that group does not exist or was removed."});
    } else {
      Vent.find({_id: {$in: foundGroup.vents}}).sort(sorting).exec(function(err, foundVents){
        if(err){
          console.log(err);
        } else {
          res.render("groups/insideAGroup", {
            ventGroup: foundGroup,
            VDisplay: foundVents,//uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name
            sortIndex: sortIndex});
        }
      })
    }
  })

})

router.get("/groups/:groupID/edit", functions.loggedIn, function(req, res){
  var groupID = req.params.groupID;
  Group.find({}, function(err){
    if(err){
      console.log(err);
    } else {
      Group.findById(groupID, function(err, foundGroup){
        //check if logged in user is admin, fi not redirect!
        if(String(req.user._id) == String(foundGroup.creator)){
          res.render("groups/editGroup", {
            ventGroup: foundGroup
          })
        } else {
          res.render("index/userError", {
            msg: "You do not have permission to edit this group"
          })
        }
      })
    }
  })
})

router.get("/groups/:groupID/follow", functions.loggedIn, function(req, res){
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

router.get("/groups/:groupID/unfollow", functions.loggedIn, function(req, res){
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

router.get("/saved", functions.loggedIn, function(req, res){

  User.findById(req.user._id).populate("saved").exec(
    function(err, foundUser){
      if(err){
        console.log(err);
      } else {

        res.render("groups/insideSaved", {
          VDisplay: foundUser.saved   //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name, must be an array
        });
      }
    }
  )
})

router.get("/originals", functions.loggedIn, function(req, res){
  User.findById(req.user._id, function(err, foundUser){
      if(err){
        console.log(err);
      } else {
        Vent.find({_id: {$in: foundUser.vents}}).sort('-date')
        .exec(function(err, foundVents){
          if(err){
            console.log(err);
          } else {
            res.render("groups/insideOriginals", {
              VDisplay: foundVents   //uniform name for list of vents or one vent to be displayed - ventPartial.ejs uses this name, must be an array
            });
          }
        })
      }
    }
  )
})

router.get("/groups/:groupID/vents/new", functions.loggedIn, function(req,res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
      res.render("index/userError", {msg: "Sorry, that group does not exist or was removed."});
    } else {
      res.render("vents/newVent", {ventGroup: foundGroup})
    }
  });
})

router.get("/vents/:ventID", functions.loggedIn, function(req,res){
  var ventID = req.params.ventID;

  Vent.findById(ventID).populate({path: "comments", populate: {path: "user"}}).exec(
    function(err, foundVent){
      if(err){
        console.log(err);
        res.render("index/userError", {msg: "Sorry, that vent does not exist or was removed."});
      } else {
        res.render("vents/vent", {
          foundVent: foundVent,
          VDisplay: [foundVent]
        })
      }
    }
  )
})

router.get("/vents/:ventID/edit", functions.loggedIn, function(req, res){
  var ventID = req.params.ventID;

  Vent.findById(ventID, function(err, foundVent){
    if(err){
      res.render("index/userError", {msg: "Sorry, we are having trouble retrieving that vent."});
    } else {
      res.render("vents/editVent", {
        foundVent: foundVent})
    }
  })

})

router.get("/vents/:ventID/save", functions.loggedIn, function(req, res){
  var ventID = req.params.ventID
  //Find the vent by the id passed in the parameter
  Vent.findById(ventID, function(err, foundVent){
      if(err){
        console.log(err);
        res.render("index/userError", {msg: "Sorry, we are having trouble retrieving that vent."});
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

router.get("/vents/:ventID/unsave", functions.loggedIn, function(req, res){
  var ventID = req.params.ventID
  //Find the vent by the id passed in the parameter
  Vent.findById(ventID, function(err, foundVent){
      if(err){
        console.log(err);
        res.render("index/userError", {msg:"Sorry, we are having trouble retrieving that vent."});
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

router.get("/login", function(req,res){
  res.render("index/login");
})

router.get("/register", function(req,res){
  res.render("index/register");
})

router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})

router.get("*", function(req,res){
  if(req.isAuthenticated()){
    res.render("index/userError", {msg: "Seems like you took the wrong turn. There's nothing here"})
  } else {
    res.render("index/nonUserError", {msg: "Seems like you took the wrong turn. There's nothing here."});
  }
})

module.exports = router;
