const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { ensureAuth } = require('../middleware/auth');

// 1. PUBLIC: Get all events for Home Page
router.get('/public/events', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeLimitMs = Date.now() - (24 * 60 * 60 * 1000);
    const timeLimitDate = new Date(timeLimitMs);

    const events = await Event.find({ 
      status: 'imported',
      $or: [
        { date: { $gte: today } },
        { lastScrapedAt: { $gte: timeLimitMs } },
        { lastScrapedAt: { $gte: timeLimitDate } },
        { updatedAt: { $gte: timeLimitDate } }
      ]
    }).sort({ date: 1 });

    res.json(events);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 2. ADMIN: Dashboard Filtered Feed
router.get('/admin/dashboard', ensureAuth, async (req, res) => {
  const { city, keyword, status, startDate, endDate } = req.query;
  let query = {};
  
  if (city) query.city = city;
  if (status) {
    query.status = status;
  } else {
    query.status = { $ne: 'inactive' };
  }
  
  if (keyword) query.title = { $regex: keyword, $options: 'i' };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  try {
    const events = await Event.find(query).sort({ status: 1, date: 1 });
    res.json(events);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 3. ADMIN: Action - Import to Live
router.patch('/admin/import/:id', ensureAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'imported', 
        'importDetails.importedAt': Date.now(), 
        'importDetails.isImported': true 
      },
      { new: true } 
    );
    res.json({ message: "Event published to live platform!", event });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;