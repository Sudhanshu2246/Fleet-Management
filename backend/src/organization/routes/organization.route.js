const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.middleware");
const { registerCompany } = require("../controllers/organization.controller");

// ─── Public Routes ─────────────────────────
router.post(
  "/register-company",
  upload.fields([
    { name: "gstDoc", maxCount: 1 },
    { name: "panImg", maxCount: 1 },
  ]),
  registerCompany,
);

module.exports = router;
