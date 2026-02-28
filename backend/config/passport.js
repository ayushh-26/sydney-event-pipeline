const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
    proxy: true 
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Logic check: Ensure profile emails exist
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: email,
        avatar: avatar
      });
      
      return done(null, user);
    } catch (err) { 
      console.error("Passport Strategy Error:", err);
      return done(err, null); 
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // FIX: Modernized deserialization to prevent 500 crashes
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error("Deserialization Error:", err);
      done(err, null);
    }
  });
};