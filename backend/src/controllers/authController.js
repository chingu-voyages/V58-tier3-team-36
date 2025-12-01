const User = require('../models/User');

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, image, googleId } = req.body;

    // Validate required fields
    if (!email || !name || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, and googleId are required',
      });
    }

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
      console.log('✅ New user created:', email);
    } else {
      // Update existing user
      user.name = name;
      user.image = image;
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.save();
      console.log('✅ User updated:', email);
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
    console.error('❌ Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};