/**
 * Admin Initialization Script
 * 
 * This script initializes the admin account if it doesn't already exist.
 * Default credentials:
 * - Login ID: admin
 * - Password: admin
 * 
 * Run with: node ./init-admin.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./src/utils/db.js";
import { Admin } from "./src/models/index.js";

const initAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ loginId: "admin" });
    if (existingAdmin) {
      console.log("ℹ️  Admin account already exists with login ID: admin");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create default admin
    const admin = await Admin.create({
      loginId: "admin",
      password: "admin", // This will be hashed by the model's pre-save hook
      email: "admin@carrental.com",
      fullName: "Admin",
      role: "superAdmin",
      permissions: {
        manageUsers: true,
        verifyUsers: true,
        manageVehicles: true,
        viewReports: true,
        manageAdmins: true,
      },
      isActive: true,
    });

    console.log("✅ Default admin account created successfully!");
    console.log("   Login ID: admin");
    console.log("   Password: admin");
    console.log("   Email: admin@carrental.com");
    console.log("   Role: superAdmin");
    console.log("\n⚠️  IMPORTANT: Change the admin password immediately after first login!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing admin:", error.message);
    process.exit(1);
  }
};

initAdmin();
