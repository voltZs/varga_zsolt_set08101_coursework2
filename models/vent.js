var mongoose = require("mongoose");

var ventSchema = mongoose.Schema({
  date: Date,
  content: String,
  category: String,
  favourited: Number,
  comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "VComment"
      }]
});

var Vent = mongoose.model("Vent", ventSchema);

module.exports = Vent;
