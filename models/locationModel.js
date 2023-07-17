const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const locationModel = mongoose.model("locations", locationSchema);

module.exports = locationModel;
