var express = require("express");
var router  = express.Router();
var functions = require("../functions");
var Group    = require("../models/group");
var Vent     = require("../models/vent");

router.put("/vents/:ventID", functions.ownsVent, function(req, res){
  var ventID = req.params.ventID;

  Vent.findByIdAndUpdate(ventID,
    {category: req.body.category, content: req.body.content},
    function(err, savedVent){
      if(err){
        console.log(err);
      } else {
        res.redirect("/vents/" + savedVent._id)
      }
    })
})

router.put("/groups/:groupID", functions.ownsGroup, function(req, res){
  var groupID = req.params.groupID;

  Group.findById(groupID, function(err, foundGroup){
    if(err){
      console.log(err);
    } else {
      var keywords = functions.keywordsIntoArray(req.body.keywords);
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

module.exports = router;
