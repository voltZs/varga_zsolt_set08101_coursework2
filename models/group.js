var mongoose = require("mongoose");

var groupSchema = mongoose.Schema({
  name: String,
  description: String,
  keywords: String,
  vents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
    }]
});

var Group = mongoose.model("Group", groupSchema);

module.exports = Group;
