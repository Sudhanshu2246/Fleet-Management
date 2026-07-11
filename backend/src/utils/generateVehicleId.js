const { sequelize } = require("../config/db");

const generateVehicleId = async (lastVehicleId, organizationId, vehicleType) => {
  // 1. Get Organization to extract initials
  const Organization = sequelize.models.Organization;
  const org = await Organization.findOne({ where: { id: organizationId } });
  
  let orgInitials = "XXX";
  if (org && org.companyName) {
    const cleanName = org.companyName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    orgInitials = cleanName.substring(0, 3).padEnd(3, "X");
  }

  // 2. Get Vehicle Type Initials
  let typeInitials = "XX";
  if (vehicleType) {
    const cleanType = vehicleType.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    typeInitials = cleanType.substring(0, 2).padEnd(2, "X");
  }

  const prefix = `${orgInitials}${typeInitials}000`; // e.g. ACMTR000

  // 3. Calculate next suffix
  let nextSuffix = "AAA";
  if (lastVehicleId && lastVehicleId.startsWith(prefix)) {
    const lastSuffix = lastVehicleId.substring(prefix.length); // get the AAA part
    if (/^[A-Z]+$/.test(lastSuffix)) {
      let carry = 1;
      let res = "";
      for (let i = lastSuffix.length - 1; i >= 0; i--) {
        let charCode = lastSuffix.charCodeAt(i);
        if (carry > 0) {
          charCode += carry;
          if (charCode > 90) { // 'Z' is 90
            charCode = 65; // 'A' is 65
            carry = 1;
          } else {
            carry = 0;
          }
        }
        res = String.fromCharCode(charCode) + res;
      }
      if (carry > 0) {
        res = "A" + res;
      }
      nextSuffix = res;
    }
  }

  return `${prefix}${nextSuffix}`;
};

module.exports = { generateVehicleId };
