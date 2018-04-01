var express = require("express");
var router  = express.Router();
var functions = require("../functions");
var Group    = require("../models/group");
var Vent     = require("../models/vent");
var VComment = require("../models/comment");

//removing a vent also deletes all comments associated with it
router.delete("/vents/:ventID", functions.loggedIn, function(req, res){
  var ventID = req.params.ventID
  //find vent - remove comments with id in vent.comments array of ids
  Vent.findById(ventID, function(err, foundVent){
    if(err){
      console.log(err);
      res.redirect("/vents/"+ ventID +"/edit");
    } else {
      VComment.remove({_id: {$in: foundVent.comments}}, function(err){
        if(err){
          console.log(err);
          res.redirect("/vents/"+ ventID +"/edit");
        } else {
          Vent.findByIdAndRemove(foundVent._id, function(err){
            if(err){
              console.log(err);
              res.redirect("/vents/"+ ventID +"/edit");
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
router.delete("/groups/:groupID", functions.loggedIn, function(req, res){
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

module.exports = router;
