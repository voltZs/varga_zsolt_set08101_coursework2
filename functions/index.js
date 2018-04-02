var functions = {};
var Group = require("../models/group")

//middleware to check if user is logged in - if not, redirect to login ROUTE
functions.loggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect("/login");
  }
}

functions.ownsVent = function(req, res, next){
  if(req.isAuthenticated()){
    for(var i = 0; i<req.user.vents; i++){
      if(String(req.params.ventID) === String(req.user.vents[i])){
        next();
      }
    }
    res.render("index/userError", {msg: "You do not own this vent."});
  } else {
    res.redirect("/login")
  }
}

functions.ownsGroup = function(req, res, next){
  if(req.isAuthenticated()){
    Group.findById(req.params.groupID, function(err, foundGroup){
      if(err){
        console.log(err);
      } else {
        if(String(foundGroup.creator) === String(req.user._id)){
          next();
        } else {
          res.render("index/userError", {msg: "You do not own this group."});
        }
      }
    })
  } else {
    res.redirect("/login")
  }
}

//turn string of keywords separated by commas or commas with a space to array of keywords
functions.keywordsIntoArray = function(stringOfKeywords){
  var stringOfKW = stringOfKeywords;
  var arrayOfKW = stringOfKW.split(', ').join(',').split(',')
  return arrayOfKW
}

//checks if any of the keywords array contains the searchString (even as a substring)
functions.compareKeywords = function(searchString, keyWordsArray){
  for(var i=0; i<keyWordsArray.length; i++){
    if(keyWordsArray[i].includes(searchString)){
      return true
    }
  }
  return false
}

module.exports = functions;
