const jwt=require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'THE_SECRET_KEY',
    { expiresIn: '24h' }
  );
};

module.exports = generateToken;