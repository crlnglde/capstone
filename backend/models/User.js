const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["daycare worker", "CSWD", "Enumerator"]},
});

module.exports = mongoose.model("User", UserSchema);
  