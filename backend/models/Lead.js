const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // This links the lead to the specific event they clicked
    required: true
  },
  consent: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);