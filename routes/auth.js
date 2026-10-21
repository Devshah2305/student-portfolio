// routes/auth.js — Register, Login, /me
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { validateAuthInput } = require("../middleware/validate");

const router = express.Router();

// ── POST /auth/register ──────────────────────────────────────
// 1. Validate input (middleware)
// 2. Check username not taken
// 3. Hash password with bcrypt (saltRounds = 10)
// 4. Save user → 201
router.post("/register", validateAuthInput, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check duplicate
    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Username already taken.",
      });
    }

    // Hash password — bcrypt generates a salt automatically at cost factor 10
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username: username.trim(),
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { id: user._id, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /auth/login ─────────────────────────────────────────
// 1. Validate input (middleware)
// 2. Find user by username
// 3. Compare password with bcrypt.compare()
// 4. Sign JWT → return token
router.post("/login", validateAuthInput, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // bcrypt.compare hashes the plain-text and compares to stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Sign JWT — payload: user id + username; expires in 1 hour
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /auth/me ─────────────────────────────────────────────
// Supplementary: returns currently logged-in user from decoded JWT
// authMiddleware sets req.user = { id, username }
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
