const express = require("express");
const router = express.Router();
const {
  getAlerts,
  createAlert,
  resolveAlert,
  getAlertStats,
  registerFcmDeviceToken,
  triggerTestAlert,
} = require("../controllers/alert.controller");
const { protect } = require("../../middlewares/auth.middleware");

// All routes are protected
router.use(protect);

router.get("/", getAlerts);
router.post("/", createAlert);
router.get("/stats", getAlertStats);
router.put("/:id/resolve", resolveAlert);
router.post("/fcm-token", registerFcmDeviceToken);
router.post("/test", triggerTestAlert);

module.exports = router;
