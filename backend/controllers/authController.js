const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { seedUserData } = require('../utils/seedData');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fintrack_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, currency, monthlySalary } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      currency: currency || 'INR',
      currencySymbol: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹',
      monthlySalary: Number(monthlySalary) || 0
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      currencySymbol: user.currencySymbol,
      monthlySalary: user.monthlySalary,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        currencySymbol: user.currencySymbol,
        monthlySalary: user.monthlySalary,
        savingsTargetRate: user.savingsTargetRate,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Instant Demo / Guest Login with Pre-seeded realistic spending data
// @route   POST /api/auth/guest
// @access  Public
const guestLogin = async (req, res) => {
  try {
    const guestEmail = 'demo@fintrack.app';
    let user = await User.findOne({ email: guestEmail });

    if (!user) {
      user = await User.create({
        name: 'Alex Morgan (Demo)',
        email: guestEmail,
        password: 'demopassword123',
        currency: 'INR',
        currencySymbol: '₹',
        monthlySalary: 65000,
        isGuest: true
      });
      // Seed rich realistic data for demo
      await seedUserData(user._id);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      currencySymbol: user.currencySymbol,
      monthlySalary: user.monthlySalary,
      savingsTargetRate: user.savingsTargetRate,
      isGuest: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, currency, monthlySalary, savingsTargetRate } = req.body;

    if (name) user.name = name;
    if (currency) {
      user.currency = currency;
      user.currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
    }
    if (monthlySalary !== undefined) user.monthlySalary = Number(monthlySalary);
    if (savingsTargetRate !== undefined) user.savingsTargetRate = Number(savingsTargetRate);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
      currencySymbol: updatedUser.currencySymbol,
      monthlySalary: updatedUser.monthlySalary,
      savingsTargetRate: updatedUser.savingsTargetRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  guestLogin,
  getUserProfile,
  updateUserProfile
};
