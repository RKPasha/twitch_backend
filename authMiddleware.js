// authMiddleware.js

const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;


// Middleware function to verify the access token and set the authenticated user
const authenticateToken = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    // Verify the access token
    const decodedToken = jwt.verify(accessToken, secretKey);

    // Set the authenticated user in the request object
    req.user = decodedToken.user;

    next();
  } catch (error) {
    console.error('Error verifying access token:', error);
    return res.status(403).json({ error: 'Invalid access token' });
  }
};

module.exports = authenticateToken;
