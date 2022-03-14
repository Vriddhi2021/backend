const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const userSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  googleId: {
    type: String,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    unique: [true, "Email should be unique"],
    trim: true,
  },
  collegeName: {
    type: String,
    required: [true, "College is required"],
    trim: true,
  },
  isNitr: {
    type: Boolean,
    required: [true, "IsNitr is required"],
    default: false,
  },
  nitrMail: {
    type: String,
    trim: true,
    unique: true,
  },
  participatedEvents: {
    type: Array,
  },
  registered: {
    type: Boolean,
    default: false,
  },
  coins: {
    type: Number,
    default: 200,
  },
  paidStatus: {
    type: Boolean,
    default: false,
  },
});
userSchema.plugin(findOrCreate);
module.exports = mongoose.model("User", userSchema);
