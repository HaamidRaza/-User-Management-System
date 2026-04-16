import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";
dotenv.config();

const seedUsers = [
  {
    name: "Super Admin",
    email: "admin@example.com",
    password: "Admin@123",
    role: "admin",
    status: "active",
  },
  {
    name: "Jane Manager",
    email: "manager@example.com",
    password: "Manager@123",
    role: "manager",
    status: "active",
  },
  {
    name: "John User",
    email: "user@example.com",
    password: "User@123",
    role: "user",
    status: "active",
  },
  {
    name: "Alice Smith",
    email: "alice@example.com",
    password: "User@123",
    role: "user",
    status: "active",
  },
  {
    name: "Bob Jones",
    email: "bob@example.com",
    password: "User@123",
    role: "user",
    status: "inactive",
  },
];

const seed = async () => {
  await connectDB();

  try {
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create admin first (no createdBy)
    const admin = await User.create(seedUsers[0]);
    console.log(`Created admin: ${admin.email}`);

    // Create rest with createdBy = admin
    for (let i = 1; i < seedUsers.length; i++) {
      const user = await User.create({
        ...seedUsers[i],
        createdBy: admin._id,
        updatedBy: admin._id,
      });
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log("\n✅ Seed complete!");
    console.log("\nTest credentials:");
    console.log("  Admin:   admin@example.com   / Admin@123");
    console.log("  Manager: manager@example.com / Manager@123");
    console.log("  User:    user@example.com    / User@123");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

seed();
