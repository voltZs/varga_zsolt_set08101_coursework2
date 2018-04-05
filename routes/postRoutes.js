var express = require("express");
var router  = express.Router();
var functions = require("../functions");
var passport = require("passport");
var User     = require("../models/user");
var Group    = require("../models/group");
var Vent     = require("../models/vent");
var VComment = require("../models/comment");

router.post("/groups", functions.loggedIn, function(req, res){
  if(req.body.name != "" && req.body.description != ""){
    Group.create({
      name: req.body.name,
      description: req.body.description,
      keywords: functions.keywordsIntoArray(req.body.keywords),
      creator: req.user
    }, function(err, savedGroup){
      if(err){
        console.log(err);
      } else {
        console.log("DB added group: " + savedGroup._id);
        res.redirect("/groups/" + savedGroup._id);
      }
    })
  } else {
    res.redirect("/groups/new");
  }
})

router.post("/groups/:groupID/vents", functions.loggedIn, function(req, res){
  var groupID = req.params.groupID;

  if(req.body.category != "" && req.body.content != ""){
    Vent.create(req.body, function(err, savedVent){
        if(err){
          console.log(err);
        } else {
          console.log("DB added vent:" + savedVent._id);
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
                          res.redirect("/vents/" + savedVent._id)
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
    res.redirect("/groups/"+ groupID +"/vents/new");
  }
})

router.post("/vents/:ventID/comment", functions.loggedIn, function(req, res){
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
                      console.log("DB added Vcomment: " + savedComment._id);
                      console.log("...to vent ID: " + foundVent._id);
                      res.redirect("/vents/" + ventID);
                    }
                  })
                }
              })
            }
          }
        )
      } else {
        res.redirect("/vents/" + ventID);
      }
    }
  })
})


router.post("/login", passport.authenticate("local", {
  successRedirect: "/welcome",
  failureRedirect: "/login"
}),function(req, res){
})


router.post("/register", function(req, res){
  User.register(new User({
        username: req.body.username,
        email: req.body.email,
        }),
      req.body.password,
      function(err, savedUser){
        if(err){
          console.log(err);
          return res.render('index/register');
        } else {
          passport.authenticate('local')(req, res, function(){
            Group.findOne({name: "VentTeam"}, function(err, foundGroup){
              if(err){
                console.log(err);
                res.redirect("/register");
              } else {
                res.redirect("/welcome");
              }
            })
          });
        }
      })
})

module.exports = router;
