const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: String,
  email: String,
  avatar: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);