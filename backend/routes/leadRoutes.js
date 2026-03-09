const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Lead = require('../models/Lead');

const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; 

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/public/send-otp', async (req, res) => {
  try {
    const { email, eventId } = req.body;
    if (!email || !eventId) return res.status(400).json({ error: 'Missing data' });

    const otp = generateOtp();
    otpStore.set(`${email}:${eventId}`, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    await transporter.sendMail({
      from: `"PulseSyd Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎟️ Your PulseSyd Verification Code',
      html: `<div style="font-family:sans-serif;padding:20px;background:#0f1115;color:#fff;border-radius:10px;">
              <h2>Your Code: <span style="color:#10B981;">${otp}</span></h2>
              <p style="color:#a1a1aa;">Enter this to access your tickets. Valid for 10 minutes.</p>
            </div>`
    });

    res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/public/verify-otp', async (req, res) => {
  try {
    const { email, otp, eventId, consent } = req.body;
    const key = `${email}:${eventId}`;
    const record = otpStore.get(key);

    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Code expired or not found. Please resend.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid code. Try again.' });
    }

    otpStore.delete(key);
    await Lead.findOneAndUpdate(
      { email, eventId },
      { email, eventId, consent, isVerified: true, verifiedAt: new Date() },
      { upsert: true }
    );

    res.status(200).json({ message: 'Verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;