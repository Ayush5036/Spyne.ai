const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Please login to access this resource' });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};