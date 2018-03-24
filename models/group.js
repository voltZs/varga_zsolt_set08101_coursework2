var mongoose = require("mongoose");

var groupSchema = mongoose.Schema({
  name: String,
  vents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vent"
    }]
});

var Group = mongoose.model("Group", groupSchema);

module.exports = Group;
