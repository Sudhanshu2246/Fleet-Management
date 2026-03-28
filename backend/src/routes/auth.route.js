const express = require("express");
const router = express.Router();

const {
  registerCompany,
  login,
  logout,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");

// ─── Public Routes ─────────────────────────
router.post("/register-company", registerCompany);
router.post("/login", login);

// ─── Protected Routes ─────────────────────
router.post("/logout", protect, logout);

module.exports = router;