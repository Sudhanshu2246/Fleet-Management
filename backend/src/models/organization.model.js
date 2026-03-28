const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    // ─── Basic Company Info ─────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
      trim: true,
    },

    // ─── Business Details ───────────────────
    gstNumber: {
      type: String,
      trim: true,
    },

    gstCertificate: {
      type: String, // Cloudinary URL
    },

    companySize: {
      type: Number, // number of vehicles or employees
      default: 0,
    },

    // ─── Ownership ──────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // company admin
      required: true,
    },

    // ─── Subscription / Plan ────────────────
    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise"],
      default: "basic",
    },

    planExpiry: {
      type: Date,
    },

    // ─── Fleet Limits (Important for SaaS) ──
    maxVehicles: {
      type: Number,
      default: 10,
    },

    maxDrivers: {
      type: Number,
      default: 20,
    },

    // ─── Status ─────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ─── Tracking Config (Advanced) ─────────
    trackingInterval: {
      type: Number, // seconds (e.g. 5 sec updates)
      default: 5,
    },

    // ─── Metadata ───────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // usually super_admin or self
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organization", organizationSchema);
