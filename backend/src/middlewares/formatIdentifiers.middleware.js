const formatIdentifiers = (req, res, next) => {
  const keysToFormat = ["vehicleNumber", "panCard", "gstNumber", "licenseNumber", "chassisNumber"];

  const formatValue = (val) => {
    if (typeof val === 'string') {
      return val.replace(/\s+/g, '').toUpperCase();
    }
    return val;
  };

  const formatObject = (obj) => {
    if (!obj) return;
    for (const key of keysToFormat) {
      if (obj[key] !== undefined && obj[key] !== null) {
        obj[key] = formatValue(obj[key]);
      }
    }
  };

  if (req.body) formatObject(req.body);
  if (req.query) formatObject(req.query);
  if (req.params) formatObject(req.params);

  next();
};

module.exports = formatIdentifiers;
