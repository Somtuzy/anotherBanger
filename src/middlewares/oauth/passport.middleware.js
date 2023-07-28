const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { userService } = require("../../services/create.service");
const { generateRandomAvatar } = require("../../utils/avatar.utils");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await userService.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ],
        });

        if (existingUser && existingUser.email === profile.emails[0].value && !existingUser.googleId) {
          // If user already exists with the same email and a password
          return done(null, "alreadyExistsWithSameEmailAndAPassword");
        }

        if (existingUser) {
          // If user exists, return the existing user
          existingUser.exists = true;
          return done(null, existingUser);
        }

        // Generates a random avatar for the user
        const avatar = await generateRandomAvatar(profile.emails[0].value);

        // If user doesn't exist, create a new user in the database
        const newUser = await userService.create({
          googleId: profile.id,
          fullname: profile.displayName,
          email: profile.emails[0].value,
          avatar: avatar,
          deleted: false,
        });

        await newUser.save();

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialization
passport.deserializeUser((user, done) => {
  userService
    .findOne({ _id: user._id })
    .then((data) => {
      return done(null, data);
    })
    .catch((err) => {
      return done(err);
    });
});
