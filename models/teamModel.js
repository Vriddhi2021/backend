const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const teamSchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
    trim: true
  },
  eventId: {
    type: Number,
    trim: true
  },
  name: {
    type: String,
    required: [true, "Team Name is required"],
    trim: true
  },
  teamMembers: {
    type: Array
  }
});
teamSchema.plugin(findOrCreate);
module.exports = mongoose.model("Team", teamSchema);
