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

const adminConfig = {
  loginId: process.env.ADMIN_LOGIN_ID || "admin",
  password: process.env.ADMIN_PASSWORD || "admin",
  email: process.env.ADMIN_EMAIL || "admin@carrental.com",
  fullName: process.env.ADMIN_FULL_NAME || "Admin",
};

const initAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to database");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ loginId: adminConfig.loginId });
    if (existingAdmin) {
      console.log(`Admin account already exists with login ID: ${adminConfig.loginId}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create default admin
    await Admin.create({
      loginId: adminConfig.loginId,
      password: adminConfig.password, // This will be hashed by the model's pre-save hook
      email: adminConfig.email,
      fullName: adminConfig.fullName,
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

    console.log("Default admin account created successfully");
    console.log(`   Login ID: ${adminConfig.loginId}`);
    console.log(
      process.env.ADMIN_PASSWORD
        ? "   Password: [loaded from ADMIN_PASSWORD env]"
        : "   Password: admin"
    );
    console.log(`   Email: ${adminConfig.email}`);
    console.log("   Role: superAdmin");
    console.log("\nIMPORTANT: Change the admin password immediately after first login.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error initializing admin:", error.message);
    process.exit(1);
  }
};

initAdmin();
