var mongoose = require("mongoose");

var ventSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
    },
  content: String,
  category: {
    type: String,
    enum: ['rant', 'confession', 'ridiculous'],
    default: 'rant'
    },
  favourited: {
    type: Number,
    min: 0,
    default: 0
    },
  comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "VComment"
      }]
});

var Vent = mongoose.model("Vent", ventSchema);

module.exports = Vent;
