const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Info ─────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
    },

    // ─── Role System ─────────────────────────
    role: {
      type: String,
      enum: ["super_admin", "company_admin", "driver"],
      default: "driver",
    },

    // ─── Company / Organization Mapping ─────
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    // ─── Company Registration Fields ────────
    companyName: {
      type: String,
      trim: true,
    },

    companyGST: {
      type: String,
      trim: true,
    },

    gstCertificate: {
      type: String, // Cloudinary URL
    },

    companyAddress: {
      type: String,
      trim: true,
    },

    companySize: {
      type: Number, // number of vehicles or employees
    },

    // ─── Driver Specific Fields ─────────────
    licenseNumber: {
      type: String,
    },

    vehicleAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    deviceId: {
      type: String, // mobile device binding
    },

    // ─── Status & Security ──────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
