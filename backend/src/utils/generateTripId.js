const { Trip, Organization } = require("../index/index.model");

const generateTripId = async (organizationId, vehicleTypeRequired, tripType, transaction) => {
  let comp = "UNK";
  if (organizationId) {
    const org = await Organization.findByPk(organizationId, { transaction });
    if (org && org.companyName) {
      comp = org.companyName.replace(/[^A-Za-z0-9]/g, "").substring(0, 3).toUpperCase();
    }
  }
  if (comp.length < 3) {
    comp = comp.padEnd(3, 'X');
  }
  const veh = (vehicleTypeRequired || "A").substring(0, 1).toUpperCase();
  
  let tr = "O";
  if (tripType === "round-trip") tr = "R";
  else if (tripType === "multi-city") tr = "M";

  const lastTrip = await Trip.findOne({
    where: { organizationId },
    order: [['createdAt', 'DESC']],
    transaction
  });

  let numStr = "000";
  let alphaStr = "AAA";

  if (lastTrip && lastTrip.tripId) {
    const parts = lastTrip.tripId.split('-');
    if (parts.length >= 5) {
      const lastNum = parts[parts.length - 2];
      const lastAlpha = parts[parts.length - 1];

      if (/^\d{3}$/.test(lastNum) && /^[A-Z]{3}$/.test(lastAlpha)) {
        let num = parseInt(lastNum, 10);
        let alpha = lastAlpha;
        num++;
        if (num > 999) {
          num = 0;
          let arr = alpha.split('');
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === 'Z') {
              arr[i] = 'A';
            } else {
              arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1);
              break;
            }
          }
          alpha = arr.join('');
        }
        numStr = num.toString().padStart(3, '0');
        alphaStr = alpha;
      }
    }
  }

  return `${comp}-${veh}-${tr}-${numStr}-${alphaStr}`;
};

module.exports = { generateTripId };
