var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  vents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
    }],
  saved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
    }]
});

var User = mongoose.model("User", userSchema);

module.exports = User;
