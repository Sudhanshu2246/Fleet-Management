const express = require("express");
const router = express.Router();

const {
  login,
  driverAppLogin,
  logout,
  driverAppLogout,
} = require("../controllers/auth.controller");

const { protect } = require("../../middlewares/auth.middleware");

// ✅ ADD THIS
const upload = require("../../middlewares/upload.middleware");

const { validateDriverLogin } = require("../../middlewares/validator.middleware");

// ─── Public Routes ─────────────────────────

router.post("/login", login);
router.post("/driver-login", validateDriverLogin, driverAppLogin);

// ─── Protected Routes ─────────────────────
router.post("/logout", protect, logout);
router.post("/driver-logout", protect, driverAppLogout);

module.exports = router;