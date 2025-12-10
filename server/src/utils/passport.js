import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/feedbacks/user.model.js";
import configOauth from "../configs/oauth/config.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    configOauth,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        let user = await User.findOne({ provider: "google", providerId });

        if (!user) {
          user = await User.create({
            provider: "google",
            providerId,
            email,
            name,
            avatar,
          });
        }

        // pass user to next step
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// If using session-based auth, you need serialize/deserialize:
passport.serializeUser((user, done) => {
  done(null, user.id); // MongoDB _id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
