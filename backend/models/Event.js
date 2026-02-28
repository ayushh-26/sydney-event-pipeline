const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  time: String,
  venue: String,
  address: String,
  city: { type: String, default: 'Sydney' },
  category: [String],
  imageUrl: String,
  sourceName: String, // e.g., "Eventbrite"
  originalUrl: { type: String, unique: true },
  
  // High-Level Requirements Logic
  status: { 
    type: String, 
    enum: ['new', 'updated', 'inactive', 'imported'], 
    default: 'new' 
  },
  hashSignature: String, // To detect changes in data
  lastScrapedAt: { type: Date, default: Date.now },
  
  // Import Metadata
  importDetails: {
    isImported: { type: Boolean, default: false },
    importedAt: Date,
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    importNotes: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);