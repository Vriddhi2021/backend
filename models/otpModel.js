const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
  code: {
    type: Number,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  expireIn: {
    type: Number,
    trim: true,
  },
});
module.exports = mongoose.model("Otp", otpSchema);
