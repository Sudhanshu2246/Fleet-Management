const { User, Organization, Vehicle, SuperAdmin, Driver } = require("../../index/index.model");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../services/email.service");
const { extractGSTDetails } = require("../../utils/gstParser");
const { uploadFromBuffer } = require("../../utils/cloudinary");
const { sequelize } = require("../../config/db");
const axios = require("axios");
// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      organization: user.organizationId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// ─── LOGIN ────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // 🔍 Find user in User table first
    let user = await User.findOne({ where: { email } });
    
    // If not found in User, check SuperAdmin table
    if (!user) {
      user = await SuperAdmin.findOne({ where: { email } });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    sendEmail({
      to: user.email,
      subject: "Login Alert - FleetIQ",
      html: `
    <p>Hello ${user.firstName || user.name},</p>
    <p>You have successfully logged into your account.</p>
    <p>If this wasn't you, please reset your password immediately.</p>
  `,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name || (user.firstName + " " + user.lastName),
        email: user.email,
        role: user.role,
        organization: user.organizationId,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ─── LOGOUT ───────────────────────────────
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully (remove token on client)",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// ─── DRIVER APP LOGIN ─────────────────────
exports.driverAppLogin = async (req, res) => {
  try {
    const { 
      driverName, 
      idToken,
      driverPhone, // kept for backward compatibility/logging
      vehicleNumber,
      coDriverName,
      coDriverPhone
    } = req.body || {};

    if (!driverName || !idToken || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Driver name, Firebase idToken and vehicle number are required",
      });
    }

    // Verify Firebase idToken using Google Identity Toolkit API
    let verifiedPhoneNumber;
    
    // 🔥 BYPASS FOR TESTING 🔥
    if (idToken === "TEST_TOKEN") {
      if (!driverPhone) {
        return res.status(400).json({ success: false, message: "driverPhone is required when using TEST_TOKEN" });
      }
      verifiedPhoneNumber = driverPhone;
    } else {
      try {
        const response = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
          { idToken }
        );
        
        const userData = response.data.users[0];
        if (!userData || !userData.phoneNumber) {
          throw new Error("Phone number not found in Firebase token");
        }
        
        verifiedPhoneNumber = userData.phoneNumber;
      } catch (error) {
        console.error("Firebase Verification Error:", error.response?.data || error.message);
        return res.status(401).json({
          success: false,
          message: "Invalid or expired Firebase ID token",
        });
      }
    }

    // Some formatting: ensure it matches DB format (e.g., stripping country code if needed)
    if (verifiedPhoneNumber.startsWith("+91")) {
      verifiedPhoneNumber = verifiedPhoneNumber.replace("+91", "");
    } else if (verifiedPhoneNumber.startsWith("+")) {
      verifiedPhoneNumber = verifiedPhoneNumber.slice(-10);
    }

    const user = await User.findOne({ 
      where: {
        phone: {
          [Op.like]: `%${verifiedPhoneNumber}%` // Match the trailing digits
        },
        role: "driver"
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Driver not found or not registered in the system",
      });
    }

    const vehicle = await Vehicle.findOne({ 
      where: {
        vehicleNumber: vehicleNumber,
        organizationId: user.organizationId
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found in your organization",
      });
    }

    // Validate co-driver if vehicle type requires it
    const heavyVehicles = ["truck", "mini_truck", "bus", "mini_bus"];
    if (heavyVehicles.includes(vehicle.type) && (!coDriverName || !coDriverPhone)) {
      return res.status(400).json({
        success: false,
        message: `coDriverName and coDriverPhone are mandatory for vehicle type: ${vehicle.type}`,
      });
    }

    // Auto-assign the vehicle to this driver upon login
    const { VehicleAssignment } = require("../../index/index.model");
    
    await VehicleAssignment.create({
      organizationId: user.organizationId,
      vehicleId: vehicle.id,
      driverId: user.id,
      coDriverName: coDriverName || null,
      coDriverPhone: coDriverPhone || null,
    });

    await vehicle.update({
      driverAssignedId: user.id,
      status: "active",
    });

    // Fetch primary driver details
    const primaryDriverRecord = await Driver.findOne({ where: { userId: user.id } });

    // Try to fetch co-driver details from DB if they exist
    let coDriverUser = null;
    let coDriverRecord = null;
    if (coDriverPhone) {
      coDriverUser = await User.findOne({ where: { phone: coDriverPhone, role: "driver", organizationId: user.organizationId } });
      if (coDriverUser) {
        coDriverRecord = await Driver.findOne({ where: { userId: coDriverUser.id } });
      }
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful and vehicle assigned",
      token,
      user: {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organization: user.organizationId,
        driverDetails: primaryDriverRecord || null
      },
      vehicle: {
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        name: vehicle.name
      },
      coDriver: coDriverName ? {
        name: coDriverUser ? (coDriverUser.firstName + " " + coDriverUser.lastName) : coDriverName,
        phone: coDriverPhone,
        id: coDriverUser ? coDriverUser.id : null,
        driverDetails: coDriverRecord || null
      } : null
    });
  } catch (error) {
    console.error("Driver Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
