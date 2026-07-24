const express = require("express");
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  assignVehicleToDriver,
  getAssignedVehicles,
  deleteAssignment,
  updateAssignment
} = require("../controllers/vehicle.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");
const upload = require("../../middlewares/upload.middleware");

// All routes are protected
router.use(protect);

router.get("/assignments", authorizeRoles("super_admin", "company_admin"), getAssignedVehicles);
router.delete("/assignments/:id", authorizeRoles("super_admin", "company_admin"), deleteAssignment);
router.put("/assignments/:id", authorizeRoles("super_admin", "company_admin"), updateAssignment);

router.get("/all-vehicles", getVehicles);

router.post(
  "/register-vehicle",
  authorizeRoles("super_admin", "company_admin"),
  upload.fields([
    { name: "registrationImage", maxCount: 1 },
    { name: "rcImage", maxCount: 1 },
    { name: "insuranceImage", maxCount: 1 },
    { name: "pollutionImage", maxCount: 1 },
  ]),
  createVehicle
);

router.post(
  "/assign",
  authorizeRoles("super_admin", "company_admin"),
  assignVehicleToDriver
);

router.get("/:id", getVehicleById);

router.put(
  "/:id",
  authorizeRoles("super_admin", "company_admin"),
  upload.fields([
    { name: "registrationImage", maxCount: 1 },
    { name: "rcImage", maxCount: 1 },
    { name: "insuranceImage", maxCount: 1 },
    { name: "pollutionImage", maxCount: 1 },
  ]),
  updateVehicle
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "company_admin"),
  deleteVehicle
);

module.exports = router;
