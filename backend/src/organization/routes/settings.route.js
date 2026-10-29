const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("../controllers/settings.controller");
const { protect } = require("../../middlewares/auth.middleware");

// Protect settings with JWT authentication
router.use(protect);

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/reset", resetSettings);

module.exports = router;
