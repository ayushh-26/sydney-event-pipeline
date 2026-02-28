const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// POST: Capture a new lead from the public frontend
router.post('/public/tickets', async (req, res) => {
  try {
    const { email, eventId, consent } = req.body;

    // Validate request
    if (!email || !eventId) {
      return res.status(400).json({ error: "Email and Event ID are required." });
    }

    // Create and save the new lead
    const newLead = await Lead.create({
      email,
      eventId,
      consent
    });

    res.status(201).json({ message: "Lead captured successfully!", lead: newLead });
  } catch (err) {
    console.error("Error capturing lead:", err);
    res.status(500).json({ error: "Failed to capture lead." });
  }
});

// GET: Fetch all leads for the Admin Dashboard
router.get('/admin/leads', async (req, res) => {
  try {
    // .populate() pulls in the event title so the admin knows what event they wanted
    const leads = await Lead.find().populate('eventId', 'title date').sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads." });
  }
});

module.exports = router;