const Driver = require("../models/driver.model");
const User = require("../../auth/models/user.model");
const { VehicleAssignment, Vehicle } = require("../../index/index.model");

exports.getDriverProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const driver = await Driver.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "email", "phone", "role", "profileImage"]
        }
      ]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.error("Get Driver Profile Error:", error);
    next(error);
  }
};

exports.getAssignedVehicleDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organizationId || req.user.organization;

    const assignment = await VehicleAssignment.findOne({
      where: {
        driverId: userId,
        organizationId,
        status: ["active", "ongoing"],
      }
    });

    if (!assignment) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No active vehicle assignment found"
      });
    }

    const vehicle = await Vehicle.findOne({
      where: { id: assignment.vehicleId },
      attributes: ['id', 'vehicleNumber', 'name', 'registrationImage', 'rcImage', 'insuranceImage', 'pollutionImage']
    });

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error("Get Assigned Vehicle Documents Error:", error);
    next(error);
  }
};

exports.updateDriverProfile = async (req, res, next) => {
  const { sequelize } = require("../../config/db");
  const { uploadFromBuffer } = require("../../utils/cloudinary");
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { 
      firstName, lastName, phone, 
      licenseNumber, licenseType, licenseExpiryDate, 
      aadhaarCard, panCard 
    } = req.body;

    const user = await User.findByPk(userId);
    const driver = await Driver.findOne({ where: { userId } });

    if (!user || !driver) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const uploadMultiple = async (filesArray) => {
      let urls = [];
      if (filesArray && Array.isArray(filesArray)) {
        for (const file of filesArray) {
          try {
            const result = await uploadFromBuffer(file.buffer, "driver_docs");
            urls.push(result.secure_url);
          } catch (error) { 
            console.log("Cloudinary Upload Failed:", error.message); 
          }
        }
      }
      return urls;
    };

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.profileImage[0].buffer, "profile_images");
          user.profileImage = result.secure_url;
        } catch (error) {
          console.log("Profile Image Upload Failed:", error.message); 
        }
      }
      if (req.files.licenseImage) driver.licenseImage = await uploadMultiple(req.files.licenseImage);
      if (req.files.aadhaarImage) driver.aadharImage = await uploadMultiple(req.files.aadhaarImage);
      if (req.files.panImage) driver.panImage = await uploadMultiple(req.files.panImage);
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save({ transaction });

    if (licenseNumber) driver.licenseNumber = licenseNumber;
    if (licenseType) driver.licenseType = licenseType;
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (aadhaarCard) driver.aadhaarCard = aadhaarCard;
    if (panCard) driver.panCard = panCard;

    await driver.save({ transaction });
    await transaction.commit();

    const updatedDriver = await Driver.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "email", "phone", "role", "profileImage"]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Update Driver Profile Error:", error);
    next(error);
  }
};
