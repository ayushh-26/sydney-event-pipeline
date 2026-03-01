const express = require('express');
const passport = require('passport');
const router = express.Router();

// Helper to get the correct frontend URL and strip any trailing slashes
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URL = rawFrontendUrl.replace(/\/$/, ""); 

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}/login` 
  }),
  (req, res) => { 
    // Redirect to production dashboard safely
    res.redirect(`${FRONTEND_URL}/admin/dashboard`); 
  }
);

// Endpoint for React to check current session
router.get('/current-user', (req, res) => {
  res.json(req.user || null);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect(`${FRONTEND_URL}/`);
  });
});

module.exports = router;