const express = require("express");
const router = express.Router();
const {
  getAuditLogs,
  getSecurityStats,
  simulateSecurityIncident,
  exportAuditLogs,
} = require("../controllers/auditLog.controller");
const { protect } = require("../../middlewares/auth.middleware");

// All security and audit routes are protected by JWT authentication
router.use(protect);

router.get("/audit-logs", getAuditLogs);
router.get("/stats", getSecurityStats);
router.post("/simulate", simulateSecurityIncident);
router.get("/export", exportAuditLogs);

module.exports = router;
