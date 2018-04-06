var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
    },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    }
});

var VComment = mongoose.model("VComment", commentSchema);

module.exports = VComment;
