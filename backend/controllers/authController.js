import { validationResult } from "express-validator";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

// @desc    Register a new user (self-registration as 'user' role)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password, role: "user" });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token on user
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: refreshToken },
    });

    res.status(201).json({
      user: user.toJSON(), // toJSON() strips password/refreshTokens
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      "+password +refreshTokens",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Your account has been deactivated. Contact an admin.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const tokens = user.refreshTokens || [];
    const updatedTokens = [...tokens.slice(-4), refreshToken];
    await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (!user.refreshTokens.includes(token)) {
      // Token reuse detected — clear all tokens (security measure)
      await User.findByIdAndUpdate(decoded.id, { refreshTokens: [] });
      return res.status(403).json({
        message: "Refresh token reuse detected. Please log in again.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    const updatedTokens = user.refreshTokens
      .filter((t) => t !== token)
      .concat(newRefreshToken);

    await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// @desc    Logout — invalidate refresh token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  const { refreshToken: token } = req.body;
  try {
    if (token) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({ user: req.user.toJSON ? req.user.toJSON() : req.user });
};
