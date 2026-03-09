const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000;

setInterval(
  () => {
    const now = Date.now();
    for (const [key, record] of otpStore.entries()) {
      if (now > record.expiresAt) {
        otpStore.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

router.post("/public/send-otp", async (req, res) => {
  try {
    const { email, eventId } = req.body;
    if (!email || !eventId)
      return res.status(400).json({ error: "Missing data" });

    const otp = generateOtp();
    otpStore.set(`${email}:${eventId}`, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    const brevoPayload = {
      sender: {
        name: "PulseSyd Events",
        email: process.env.BREVO_SENDER_EMAIL, 
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "🎟️ Your PulseSyd Verification Code",
      htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#0f1115;color:#fff;border-radius:10px;">
                      <h2>Your Code: <span style="color:#10B981;">${otp}</span></h2>
                      <p style="color:#a1a1aa;">Enter this to access your tickets. Valid for 10 minutes.</p>
                    </div>`,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify(brevoPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo Rejected:", JSON.stringify(data, null, 2));
      return res
        .status(500)
        .json({ error: "Mail server rejected the request." });
    }

    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("Internal Error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

router.post("/public/verify-otp", async (req, res) => {
  try {
    const { email, otp, eventId, consent } = req.body;
    const key = `${email}:${eventId}`;
    const record = otpStore.get(key);

    if (!record || Date.now() > record.expiresAt) {
      return res
        .status(400)
        .json({ error: "Code expired or not found. Please resend." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid code. Try again." });
    }

    otpStore.delete(key);
    await Lead.findOneAndUpdate(
      { email, eventId },
      { email, eventId, consent, isVerified: true, verifiedAt: new Date() },
      { upsert: true },
    );

    res.status(200).json({ message: "Verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;