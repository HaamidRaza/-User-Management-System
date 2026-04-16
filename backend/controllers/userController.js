import { validationResult } from "express-validator";
import User from "../models/User.js";

// Helper: generate a random temp password
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-10) + "A1!";
};

// @desc    Get all users (paginated, searchable, filterable)
// @route   GET /api/users
// @access  Admin, Manager
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.user.role === "manager") {
      filter.role = { $ne: "admin" }; // safe — remove the req.query.role assignment above for managers
    }
    // Change the query.role block to:
    if (req.query.role && req.user.role !== "manager") {
      filter.role = req.query.role;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Admin, Manager (not own-admin), or self
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Regular users can only view their own profile
    if (req.user.role === "user" && req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this profile" });
    }

    // Manager cannot view admin profiles
    if (req.user.role === "manager" && user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view admin profiles" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin only
export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, status } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password: password || generateTempPassword(),
      role: role || "user",
      status: status || "active",
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({ user, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin (any user), Manager (non-admin users), User (own profile only)
export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const requesterId = req.user._id.toString();
    const targetId = req.params.id;
    const requesterRole = req.user.role;

    // Regular user: can only update own profile, cannot change role
    if (requesterRole === "user") {
      if (requesterId !== targetId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this profile" });
      }
      // Prevent role change
      delete req.body.role;
      delete req.body.status;
    }

    // Manager: can update non-admin users only, cannot change roles
    if (requesterRole === "manager") {
      if (targetUser.role === "admin") {
        return res
          .status(403)
          .json({ message: "Managers cannot update admin accounts" });
      }
      delete req.body.role; // managers can't change roles
    }

    const { name, email, password, role, status } = req.body;
    const updates = { updatedBy: req.user._id };

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined && requesterRole === "admin") updates.role = role;
    if (status !== undefined && requesterRole === "admin")
      updates.status = status;

    // Handle password update separately (needs hashing via pre-save hook)
    if (password) {
      targetUser.set(updates);
      targetUser.password = password;
      await targetUser.save();
      await targetUser.populate("createdBy", "name email");
      await targetUser.populate("updatedBy", "name email");
      return res.json({
        user: targetUser,
        message: "User updated successfully",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    res.json({ user: updatedUser, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Soft delete (deactivate) user
// @route   DELETE /api/users/:id
// @access  Admin only
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    // Soft delete: deactivate instead of removing from DB
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive", updatedBy: req.user._id },
      { new: true },
    );

    res.json({ user: updatedUser, message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
