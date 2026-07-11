const { body, validationResult } = require('express-validator');

exports.validateDriverLogin = [
  body('driverName').notEmpty().withMessage('Driver name is required'),
  body('idToken').notEmpty().withMessage('Firebase idToken is required for OTP verification'),
  body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

exports.validateTripStart = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('source.address').notEmpty().withMessage('Source address is required'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
