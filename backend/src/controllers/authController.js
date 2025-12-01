const User = require('../models/User');

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, image, googleId } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        name,
        image,
        googleId,
      });
      await user.save();
    } else {
      // Update existing user
      user.name = name;
      user.image = image;
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.save();
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};