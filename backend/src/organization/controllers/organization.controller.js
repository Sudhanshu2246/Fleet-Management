const { User, Organization } = require("../../index/index.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../services/email.service");
const { extractGSTDetails } = require("../../utils/gstParser");
const { uploadFromBuffer } = require("../../utils/cloudinary");
const { sequelize } = require("../../config/db");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      organization: user.organizationId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// ─── Register Company ─────────────────────
exports.registerCompany = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      companyName,
      name,
      email,
      phone,
      password,
      companyType,
      gstIn,
      legalName,
      gstEmail,
      gstPhone,
      gstAddress,
      companyAddress,
      panNumber,
    } = req.body || {};

    if (
      !companyName ||
      !name ||
      !email ||
      !phone ||
      !password ||
      !companyType ||
      !gstIn ||
      !legalName ||
      !gstEmail ||
      !gstPhone ||
      !gstAddress ||
      !companyAddress ||
      !panNumber
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 📄 Upload Documents
    let gstDocUrl = null;
    let panImgUrl = null;
    let extractedGST = {};

    if (req.files && req.files.gstDoc && req.files.gstDoc[0]) {
      try {
        extractedGST = await extractGSTDetails(req.files.gstDoc[0].buffer);
      } catch (err) {
        console.log("GST Parse Failed:", err.message);
        extractedGST = {};
      }

      try {
        const result = await uploadFromBuffer(req.files.gstDoc[0].buffer, "company_docs");
        gstDocUrl = result.secure_url;
      } catch (err) {
        console.log("Cloudinary Upload Failed:", err.message);
      }
    }

    if (req.files && req.files.panImg && req.files.panImg[0]) {
      try {
        const result = await uploadFromBuffer(req.files.panImg[0].buffer, "company_docs");
        panImgUrl = result.secure_url;
      } catch (err) {
        console.log("Cloudinary Upload Failed (PAN):", err.message);
      }
    }

    // 👤 Create User FIRST
    const [firstName, ...lastNameParts] = (name || "").split(" ");
    const user = await User.create(
      {
        firstName: firstName || "Admin",
        lastName: lastNameParts.join(" ") || " ",
        email,
        password: hashedPassword,
        phone: phone || "0000000000",
        role: "company_admin",
      },
      { transaction },
    );

    // 🏢 Create Organization WITH owner
    const organization = await Organization.create(
      {
        companyName,
        companyType,
        primaryContactName: name,
        primaryContactEmail: email,
        primaryContactPhone: phone,
        companyAddress,
        gstIn: extractedGST.gstNumber || gstIn,
        gstLegalName: extractedGST.legalName || legalName,
        gstEmail: extractedGST.gstEmail || gstEmail,
        gstPhone: gstPhone,
        gstAddress: extractedGST.address || gstAddress,
        gstDoc: gstDocUrl,
        panNumber,
        panImg: panImgUrl,
        ownerId: user.id,
      },
      { transaction },
    );

    // 🔗 Link back to user
    user.organizationId = organization.id;
    await user.save({ transaction });

    await transaction.commit();

    const token = generateToken(user);

    // 📧 Send Welcome Email
    sendEmail({
      to: email,
      subject: "Welcome to FleetIQ 🚀",
      html: `
    <div style="font-family: Arial;">
      <h2>Welcome ${name || "Admin"} 👋</h2>
      <p>Your company <b>${companyName}</b> has been successfully registered.</p>
      <p>You can now login and start managing your fleet.</p>
      <br/>
      <p>— FleetIQ Team</p>
    </div>
  `,
    });

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      token,
      organization,
      user,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Register Company Error FULL:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
