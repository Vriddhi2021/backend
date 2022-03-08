const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
    trim: true,
  },
  eventName: {
    type: String,
    required: [true, "eventName is required"],
    trim: true,
  },
  eventOrganiser: {
    type: String,
    required: [true, "eventOrganiser is required"],
    trim: true,
  },
  eventDescription: {
    type: String,
    required: [true, "eventDescription is required"],
    trim: true,
  },
  flagship: {
    type: Boolean,
    required: [true, "flagship is required"],
  },
  startTime: {
    type: Date,
    required: [true, "startTime is required"],
  },
  endTime: {
    type: Date,
    required: [true, "endTime is required"],
  },
  maximumParticipants: {
    type: Number,
    required: [true, "maximumParticipants is required"],
    default: 1,
  },
});

module.exports = mongoose.model("Event", eventSchema);
