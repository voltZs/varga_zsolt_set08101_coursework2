var mongoose = require("mongoose");

var groupSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 30
    },
  description: {
    type: String,
    required: true
    },
  keywords: [String],
  //vents that have been posted into the group
  vents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
    }],
  //person who created the group
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

var Group = mongoose.model("Group", groupSchema);

module.exports = Group;
