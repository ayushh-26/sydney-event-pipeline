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
    ref: 'Event',
    required: true
  },
  consent: {
    type: Boolean,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
}, { timestamps: true });

leadSchema.index({ email: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);