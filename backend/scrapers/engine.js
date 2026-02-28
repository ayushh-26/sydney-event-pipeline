const crypto = require('crypto');
const Event = require('../models/Event');

/**
 * Normalizes event data to create a stable, unique fingerprint.
 * This prevents "phantom updates" caused by whitespace, case sensitivity, or date formatting.
 */
const generateHash = (data) => {
  const cleanTitle = (data.title || "").trim().toLowerCase();
  const cleanVenue = (data.venue || "").trim().toLowerCase();
  
  let cleanDate = "";
  try {
    cleanDate = new Date(data.date).toISOString().split('T')[0];
  } catch (e) {
    cleanDate = data.date; 
  }

  const content = `${cleanTitle}|${cleanDate}|${cleanVenue}`;
  return crypto.createHash('md5').update(content).digest('hex');
};

const runPipeline = async (scrapedEvents) => {
  console.log(`⚙️ Pipeline: Processing ${scrapedEvents.length} intercepted events...`);
  
  // THE FIX: Use a strict Date object, not a Number!
  const startTime = new Date(); 

  for (let eventData of scrapedEvents) {
    const currentHash = generateHash(eventData);
    
    const existingEvent = await Event.findOne({ originalUrl: eventData.originalUrl });

    if (!existingEvent) {
      // CASE 1: BRAND NEW
      await Event.create({ 
        ...eventData, 
        hashSignature: currentHash, 
        status: 'new',
        lastScrapedAt: startTime // Saves as strict ISODate
      });
    } else {
      // CASE 2: EXISTS
      const hasChanged = existingEvent.hashSignature !== currentHash;
      
      let updatePayload = { 
        ...eventData, 
        lastScrapedAt: startTime, // Saves as strict ISODate
        hashSignature: currentHash 
      };

      if (hasChanged && existingEvent.status !== 'imported') {
        updatePayload.status = 'updated';
      } else if (existingEvent.status === 'imported') {
        delete updatePayload.status; 
      }

      await Event.updateOne({ _id: existingEvent._id }, { $set: updatePayload });
    }
  }

  // CASE 3: INACTIVE DETECTION (For un-imported events)
  // Mark events as inactive if they weren't found in this run.
  await Event.updateMany(
    { 
      lastScrapedAt: { $lt: startTime }, 
      status: { $in: ['new', 'updated'] } 
    },
    { $set: { status: 'inactive' } }
  );

  // CASE 4: ARCHIVE EXPIRED IMPORTS (The "Self-Cleaning" Logic)
  // If an event was imported, its date has passed, AND the scraper didn't see it today...
  // It is completely over. Move it to inactive to clear the dashboard.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await Event.updateMany(
    {
      status: 'imported',
      date: { $lt: startOfToday }, // The official date is in the past
      lastScrapedAt: { $lt: startTime } // The scraper also stopped seeing it
    },
    { $set: { status: 'inactive' } }
  );

  console.log("✅ Pipeline: Sync complete. Fingerprints stabilized & expired events archived.");
};

module.exports = { runPipeline };