const express = require("express");
const router = express.Router();
const {
  createDriver,
  getDrivers,
  getDriverById,
  assignVehicle,
  updateDriverStatus,
  updateDriver,
  deleteDriver,
  getDriverDashboard,
} = require("../controllers/driver.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");
const upload = require("../../middlewares/upload.middleware");

// All routes are protected
router.use(protect);

router.get("/all-drivers", getDrivers);

// Driver App Routes
router.get("/dashboard", getDriverDashboard);

router.post(
  "/register-driver",
  authorizeRoles("company_admin"),
  upload.fields([
    { name: "licenseImage", maxCount: 2 },
    { name: "aadhaarImage", maxCount: 2 },
    { name: "panImage", maxCount: 2 },
  ]),
  createDriver
);

router.post(
  "/assign-vehicle",
  authorizeRoles("company_admin"),
  assignVehicle
);

router.put(
  "/:id/status",
  authorizeRoles("company_admin"),
  updateDriverStatus
);

router.put(
  "/:id",
  authorizeRoles("company_admin"),
  upload.fields([
    { name: "licenseImage", maxCount: 2 },
    { name: "aadhaarImage", maxCount: 2 },
    { name: "panImage", maxCount: 2 },
  ]),
  updateDriver
);

router.get("/:id", getDriverById);

router.delete(
  "/:id",
  authorizeRoles("company_admin"),
  deleteDriver
);

module.exports = router;
