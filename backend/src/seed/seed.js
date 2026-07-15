// Creates an initial admin user so you can log in and start creating staff/customers.
// Run with: npm run seed
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();

  const email = "admin@ledgervault.bank";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin user already exists:", email);
  } else {
    await User.create({
      name: "System Administrator",
      email,
      password: "ChangeMe123!",
      role: "admin",
      status: "active",
      hiredAt: new Date(),
    });
    console.log("Admin user created:");
    console.log("  email:   ", email);
    console.log("  password:", "ChangeMe123!");
    console.log("Log in and change this password / create real staff accounts immediately.");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});