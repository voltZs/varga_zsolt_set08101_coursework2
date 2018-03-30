var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  //vents that the user posted
  vents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
  }],
  //vents that the user has favourited
  saved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
  }],
  //these are the groups the user follows
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  }]
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

module.exports = User;
