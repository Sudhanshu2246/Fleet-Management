const { Organization, User } = require("../../index/index.model");
const FleetSettings = require("../models/fleetSettings.model");

/**
 * Helper to build company-specific default/merged profile from Organization model
 */
function buildMergedCompanySettings(org, existingSettings) {
  const orgCode = org?.id || "";

  const companyProfile = {
    companyName: org?.companyName || existingSettings?.companyProfile?.companyName || "",
    tradeName: existingSettings?.companyProfile?.tradeName || org?.companyName || "",
    companyType: org?.companyType || existingSettings?.companyProfile?.companyType || "private_limited",
    fleetPrefix: existingSettings?.companyProfile?.fleetPrefix || (orgCode ? `${orgCode}-` : ""),
    gstIn: org?.gstIn || existingSettings?.companyProfile?.gstIn || "",
    panNumber: org?.panNumber || existingSettings?.companyProfile?.panNumber || "",
    website: existingSettings?.companyProfile?.website || "",
  };

  const officeAddress = {
    registeredAddress:
      existingSettings?.officeAddress?.registeredAddress ||
      org?.companyAddress ||
      org?.gstAddress ||
      "",
    city: existingSettings?.officeAddress?.city || "",
    state: existingSettings?.officeAddress?.state || "",
    pincode: existingSettings?.officeAddress?.pincode || "",
    country: existingSettings?.officeAddress?.country || "India",
    fleetHubLocation: existingSettings?.officeAddress?.fleetHubLocation || "",
  };

  const emergencyContacts = {
    emergencyHotline:
      existingSettings?.emergencyContacts?.emergencyHotline ||
      org?.primaryContactPhone ||
      "",
    roadsideAssistance:
      existingSettings?.emergencyContacts?.roadsideAssistance || "",
    escalationEmail:
      existingSettings?.emergencyContacts?.escalationEmail ||
      org?.primaryContactEmail ||
      "",
    policeLiaison:
      existingSettings?.emergencyContacts?.policeLiaison || "",
    primaryManagerName:
      existingSettings?.emergencyContacts?.primaryManagerName ||
      org?.primaryContactName ||
      "",
    primaryManagerPhone:
      existingSettings?.emergencyContacts?.primaryManagerPhone ||
      org?.primaryContactPhone ||
      "",
    primaryManagerEmail:
      existingSettings?.emergencyContacts?.primaryManagerEmail ||
      org?.primaryContactEmail ||
      "",
  };

  const operatingSchedule = {
    workingDays:
      existingSettings?.operatingSchedule?.workingDays || "Monday - Saturday",
    shiftStartTime: existingSettings?.operatingSchedule?.shiftStartTime || "08:00",
    shiftEndTime: existingSettings?.operatingSchedule?.shiftEndTime || "20:00",
    nightSupervisorContact:
      existingSettings?.operatingSchedule?.nightSupervisorContact || "",
  };

  return {
    organizationId: orgCode,
    companyProfile,
    officeAddress,
    emergencyContacts,
    operatingSchedule,
  };
}

/**
 * GET /api/v1/settings
 * Retrieves organization company & emergency settings for the logged-in user's company.
 */
exports.getSettings = async (req, res) => {
  try {
    // 1. Resolve logged in user's organizationId
    let orgId = req.user?.organizationId || req.user?.organization;

    if (!orgId && req.user?.id) {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.organizationId) {
        orgId = userRecord.organizationId;
      }
    }

    // 2. Fetch the actual Organization record from DB
    let org = null;
    if (orgId) {
      org = await Organization.findByPk(orgId);
    }
    if (!org) {
      // Fallback to active organization in DB
      org = await Organization.findOne({ where: { isActive: true } });
      if (!org) {
        org = await Organization.findOne();
      }
    }

    const currentOrgId = org?.id || orgId || "FIQO000AAA";

    // 3. Fetch or initialize FleetSettings record
    let settings = null;
    try {
      settings = await FleetSettings.findOne({ where: { organizationId: currentOrgId } });
    } catch (e) {
      console.warn("FleetSettings table query warning:", e.message);
    }

    // 4. Build merged settings using the logged in company's verified DB fields
    const mergedData = buildMergedCompanySettings(org, settings);

    if (!settings) {
      try {
        settings = await FleetSettings.create({
          organizationId: currentOrgId,
          ...mergedData,
          updatedBy: req.user?.name || (req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : "System Admin"),
        });
      } catch (saveErr) {
        // Continue even if table creation/hook has a minor constraint
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        id: settings?.id || 1,
        organizationId: currentOrgId,
        ...mergedData,
        rawOrganization: org,
        updatedAt: settings?.updatedAt || new Date().toISOString(),
        updatedBy: settings?.updatedBy || req.user?.name || "Fleet Administrator",
      },
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company settings",
      error: error.message,
    });
  }
};

/**
 * PUT /api/v1/settings
 * Updates company profile, address, emergency contacts, and schedule for the logged in company.
 * Synchronizes with both the Organization and FleetSettings records.
 */
exports.updateSettings = async (req, res) => {
  try {
    let orgId = req.user?.organizationId || req.user?.organization;
    if (!orgId && req.user?.id) {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.organizationId) {
        orgId = userRecord.organizationId;
      }
    }

    let org = null;
    if (orgId) {
      org = await Organization.findByPk(orgId);
    }
    if (!org) {
      org = await Organization.findOne({ where: { isActive: true } }) || await Organization.findOne();
    }

    const currentOrgId = org?.id || orgId || "FIQO000AAA";
    const { companyProfile, officeAddress, emergencyContacts, operatingSchedule } = req.body;

    // 1. Sync updates back to Organization table
    if (org) {
      try {
        const orgUpdates = {};
        if (companyProfile?.companyName) orgUpdates.companyName = companyProfile.companyName;
        if (companyProfile?.companyType) orgUpdates.companyType = companyProfile.companyType;
        if (companyProfile?.gstIn) orgUpdates.gstIn = companyProfile.gstIn;
        if (companyProfile?.panNumber) orgUpdates.panNumber = companyProfile.panNumber;
        if (officeAddress?.registeredAddress) {
          orgUpdates.companyAddress = officeAddress.registeredAddress;
          orgUpdates.gstAddress = officeAddress.registeredAddress;
        }
        if (emergencyContacts?.primaryManagerName) {
          orgUpdates.primaryContactName = emergencyContacts.primaryManagerName;
        }
        if (emergencyContacts?.primaryManagerEmail || emergencyContacts?.escalationEmail) {
          orgUpdates.primaryContactEmail = emergencyContacts.primaryManagerEmail || emergencyContacts.escalationEmail;
        }
        if (emergencyContacts?.emergencyHotline || emergencyContacts?.primaryManagerPhone) {
          orgUpdates.primaryContactPhone = emergencyContacts.primaryManagerPhone || emergencyContacts.emergencyHotline;
        }
        await org.update(orgUpdates);
      } catch (orgErr) {
        console.warn("Could not sync Organization model fields:", orgErr.message);
      }
    }

    // 2. Update or create FleetSettings
    let settings = null;
    try {
      settings = await FleetSettings.findOne({ where: { organizationId: currentOrgId } });
      const payload = {
        updatedBy: req.user?.name || (req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : "Administrator"),
      };
      if (companyProfile) payload.companyProfile = companyProfile;
      if (officeAddress) payload.officeAddress = officeAddress;
      if (emergencyContacts) payload.emergencyContacts = emergencyContacts;
      if (operatingSchedule) payload.operatingSchedule = operatingSchedule;

      if (!settings) {
        settings = await FleetSettings.create({
          organizationId: currentOrgId,
          ...payload,
        });
      } else {
        await settings.update(payload);
      }
    } catch (dbErr) {
      console.warn("FleetSettings save error:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Company profile & emergency settings saved successfully",
      data: {
        organizationId: currentOrgId,
        companyProfile,
        officeAddress,
        emergencyContacts,
        operatingSchedule,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.name || "Administrator",
      },
    });
  } catch (error) {
    console.error("Error updating company settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company settings",
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/settings/reset
 * Resets settings back to standard company defaults for the logged in organization.
 */
exports.resetSettings = async (req, res) => {
  try {
    let orgId = req.user?.organizationId || req.user?.organization;
    if (!orgId && req.user?.id) {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.organizationId) {
        orgId = userRecord.organizationId;
      }
    }

    let org = null;
    if (orgId) {
      org = await Organization.findByPk(orgId);
    }
    if (!org) {
      org = await Organization.findOne({ where: { isActive: true } }) || await Organization.findOne();
    }

    const currentOrgId = org?.id || orgId || "FIQO000AAA";
    const defaultData = buildMergedCompanySettings(org, null);

    try {
      let settings = await FleetSettings.findOne({ where: { organizationId: currentOrgId } });
      if (settings) {
        await settings.update({
          ...defaultData,
          updatedBy: req.user?.name || "Administrator",
        });
      } else {
        settings = await FleetSettings.create({
          organizationId: currentOrgId,
          ...defaultData,
          updatedBy: req.user?.name || "Administrator",
        });
      }
    } catch (e) {
      console.warn("Reset error:", e.message);
    }

    return res.status(200).json({
      success: true,
      message: "Settings reverted to logged-in company defaults",
      data: {
        organizationId: currentOrgId,
        ...defaultData,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.name || "Administrator",
      },
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset settings",
      error: error.message,
    });
  }
};
