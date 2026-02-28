require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const session = require('express-session');
const passport = require('passport');
const { scrapeSydneyEvents } = require("./scrapers/sydneyScraper");

// Initialize Passport Config
require('./config/passport')(passport);

const app = express();

// FIX 1: Trust the Render Proxy (Crucial for HTTPS and Redirect URIs)
app.enable('trust proxy');

// 1. CORS Configuration
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy Blocked'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// 2. Body Parser
app.use(express.json());

// 3. Session & Passport Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'sydney_events_secret_key',
  resave: false,
  saveUninitialized: false,
  proxy: true, // FIX 2: Explicitly tell session to trust the proxy
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // FIX 3: Required for cross-domain cookies (Vercel -> Render)
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 5. Internal Fallback Cron
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Internal cron: Running daily event scrape...");
  scrapeSydneyEvents();
});

// 6. SECURE AUTOMATED SCRAPER WEBHOOK (PRODUCTION)
app.get('/api/cron/scrape', (req, res) => {
  const authHeader = req.headers['x-cron-secret'];
  const querySecret = req.query.secret; 
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Server misconfiguration: CRON_SECRET not set." });
  }

  if (authHeader !== secret && querySecret !== secret) {
    console.warn("⚠️ Unauthorized scrape attempt blocked.");
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    console.log("🤖 Secure automated webhook triggered. Initiating background scrape...");
    scrapeSydneyEvents().catch(err => console.error("Background Scraper Error:", err));
    
    res.status(200).json({ 
      message: "Scraper pipeline successfully initiated in the background.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Routes
app.use("/api", require("./routes/eventRoutes"));
app.use("/api", require("./routes/leadRoutes"));
app.use("/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));