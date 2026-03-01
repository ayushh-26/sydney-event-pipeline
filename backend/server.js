require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const session = require('express-session');
const passport = require('passport');
const { scrapeSydneyEvents } = require("./scrapers/sydneyScraper");

require('./config/passport')(passport);

const app = express();

// 1. TRUST PROXY (Required for Render + HTTPS)
app.enable('trust proxy');

// 2. SMART CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:5173", 
  process.env.FRONTEND_URL,
  "https://pulsesyd.vercel.app"
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Remove trailing slashes from config

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const sanitizedOrigin = origin.replace(/\/$/, "");
    
    if (allowedOrigins.includes(sanitizedOrigin)) {
      callback(null, true);
    } else {
      // THIS LOG IS CRITICAL: Look at Render logs to see what string is here
      console.error(`❌ CORS Policy Blocked origin: ${origin}`);
      callback(new Error('CORS Policy Blocked'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret']
}));

app.use(express.json());

// 3. SESSION CONFIG (Samesite None is required for cross-domain)
app.use(session({
  secret: process.env.SESSION_SECRET || 'sydney_events_secret_key',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true, // Always true on Render/Vercel (HTTPS)
    sameSite: 'none', // Critical for Vercel -> Render communication
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 4. DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 5. CRON
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Internal cron: Running daily event scrape...");
  scrapeSydneyEvents();
});

// 6. SCRAPER WEBHOOK
app.get('/api/cron/scrape', (req, res) => {
  const secret = process.env.CRON_SECRET;
  const incomingSecret = req.headers['x-cron-secret'] || req.query.secret;

  if (!secret || incomingSecret !== secret) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    scrapeSydneyEvents().catch(err => console.error("Background Scraper Error:", err));
    res.status(200).json({ message: "Scraper pipeline initiated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. ROUTES
app.use("/api", require("./routes/eventRoutes"));
app.use("/api", require("./routes/leadRoutes"));
app.use("/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));