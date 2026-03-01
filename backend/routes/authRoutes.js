const express = require('express');
const passport = require('passport');
const router = express.Router();

// Helper to get the correct frontend URL from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    // FIX: Redirect to production login if auth fails
    failureRedirect: `${FRONTEND_URL}/login` 
  }),
  (req, res) => { 
    // FIX: Redirect to production dashboard on success
    res.redirect(`${FRONTEND_URL}/admin/dashboard`); 
  }
);

// NEW: Endpoint for React to check current session
router.get('/current-user', (req, res) => {
  res.json(req.user || null);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    // FIX: Redirect to production home on logout
    res.redirect(`${FRONTEND_URL}/`);
  });
});

module.exports = router;