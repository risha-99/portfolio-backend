const express = require("express");
const User = require("../models/User");
const { ROLES } = require("../models/User");
const { signToken, requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user || user.role !== ROLES.ADMIN) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is inactive" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/admin/me", requireAuth, requireAdmin, (req, res) => {
  res.status(200).json({ user: req.user.toSafeJSON() });
});

module.exports = router;
