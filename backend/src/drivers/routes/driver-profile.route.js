const express = require("express");
const router = express.Router();
const { getDriverProfile, getAssignedVehicleDocuments, updateDriverProfile } = require("../controllers/driver-profile.controller");
const { protect } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

router.get("/", protect, getDriverProfile);
router.get("/vehicle-documents", protect, getAssignedVehicleDocuments);

router.put(
  "/",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 2 },
    { name: "aadhaarImage", maxCount: 2 },
    { name: "panImage", maxCount: 2 },
  ]),
  updateDriverProfile
);

module.exports = router;
