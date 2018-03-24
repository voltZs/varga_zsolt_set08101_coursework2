var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
  date: Date,
  content: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    }
});

var VComment = mongoose.model("VComment", commentSchema);

module.exports = VComment;
