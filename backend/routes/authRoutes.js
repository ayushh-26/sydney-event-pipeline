const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => { res.redirect('http://localhost:5173/admin/dashboard'); }
);

// NEW: Endpoint for React to check current session
router.get('/current-user', (req, res) => {
  res.json(req.user || null);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('http://localhost:5173/');
  });
});

module.exports = router;