const User = require("../models/user.model");
const Organization = require("../models/organization.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      organization: user.organization,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// ─── Register Company ─────────────────────
exports.registerCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      companyName,
      companyGST,
      companyAddress,
      companySize,
    } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 📄 Upload GST Certificate
    let gstUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "fleet/gst" },
        async (error, result) => {
          if (error) throw error;
          gstUrl = result.secure_url;
        },
      );

      // convert buffer to stream
      const streamifier = require("streamifier");
      streamifier.createReadStream(req.file.buffer).pipe(result);
    }

    // 🏢 Create Organization
    const organization = await Organization.create({
      name: companyName,
      email,
      phone,
      address: companyAddress,
      gstNumber: companyGST,
      companySize,
      gstCertificate: gstUrl,
    });

    // 👤 Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "company_admin",
      organization: organization._id,
    });

    organization.owner = user._id;
    await organization.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      token,
      organization,
      user,
    });
  } catch (error) {
    console.error("Register Company Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ─── LOGIN ────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔴 Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // 🔍 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🚫 Check active status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    // 🔑 Generate token
    const token = generateToken(user);

    // ✅ Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
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
