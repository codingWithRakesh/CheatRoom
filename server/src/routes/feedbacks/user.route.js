import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// 1) Start Google login – redirect user to Google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2) Callback – Google redirects here
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login-failed" }),
  (req, res) => {
    // req.user is set by Passport (from verify callback in passport-config.js)
    const user = req.user;

    // Create JWT for your app
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token into httpOnly cookie (so not accessible via JS)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set true in production with HTTPS
      sameSite: "lax",
    });

    // Redirect back to frontend
    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Check current user (React can call this)
router.get("/me", (req, res) => {
  // If you're using JWT cookie, verify it here
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
});

export default router;
