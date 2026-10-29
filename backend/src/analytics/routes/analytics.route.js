const express = require("express");
const router = express.Router();
const {
  getAnalyticsOverview,
  getDriverLeaderboard,
  getStoppageAnalysis,
  exportAnalyticsReport,
} = require("../controllers/analytics.controller");
const { protect } = require("../../middlewares/auth.middleware");

// All routes protected by JWT auth
router.use(protect);

router.get("/overview", getAnalyticsOverview);
router.get("/driver-leaderboard", getDriverLeaderboard);
router.get("/stoppage-analysis", getStoppageAnalysis);
router.get("/export", exportAnalyticsReport);

module.exports = router;
