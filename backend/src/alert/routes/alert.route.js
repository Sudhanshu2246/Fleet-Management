const express = require("express");
const router = express.Router();
const {
  getAlerts,
  createAlert,
  resolveAlert,
  getAlertStats,
} = require("../controllers/alert.controller");
const { protect } = require("../../middlewares/auth.middleware");

// All routes are protected
router.use(protect);

router.get("/", getAlerts);
router.post("/", createAlert);
router.get("/stats", getAlertStats);
router.put("/:id/resolve", resolveAlert);

module.exports = router;
