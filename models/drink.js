const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const drinkSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  recipe: { type: String, required: true },
  img: { type: String },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  creatorName: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model("Drink", drinkSchema);
