import { Router } from "express";
import { body } from "express-validator";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize, validateObjectId } from "../middleware/auth.js";

const router = Router();

// Shared validation rules
const createUserValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "user"])
    .withMessage("Invalid role"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid status"),
];

const updateUserValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "user"])
    .withMessage("Invalid role"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid status"),
];

// GET /api/users — Admin & Manager only
router.get("/", protect, authorize("admin", "manager"), getUsers);

// GET /api/users/:id — Admin, Manager, or own profile (handled in controller)
router.get("/:id", protect, validateObjectId, getUserById);

// POST /api/users — Admin only
router.post("/", protect, authorize("admin"), createUserValidation, createUser);

// PUT /api/users/:id — Admin, Manager (non-admin), or own profile (handled in controller)
router.put("/:id", protect, validateObjectId, updateUserValidation, updateUser);

// DELETE /api/users/:id — Admin only (soft delete)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId,
  deleteUser,
);

export default router;
