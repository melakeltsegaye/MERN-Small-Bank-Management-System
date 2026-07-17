import mongoose, { model } from "mongoose";
import bcrypt from "bcryptjs"

export const ROLES = ["customer", "employee", "loan_officer", "manager", "admin"];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2, 
            maxlength: 100 
        },
        email: {
            type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: { type: String, required: [true, "Password is required"], minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: "customer", required: true },
    phone: { type: String, trim: true },
    address: { street: String, city: String, state: String, zipCode: String, country: String },
    employeeId: { type: String, unique: true, sparse: true },
    branch: { type: String, trim: true },
    hiredAt: { type: Date },
    status: { type: String, enum: ["active", "suspended", "deactivated"], default: "active" },
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
      },
    ],
    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

userSchema.index({role: 1})

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

export const User = mongoose.model("User", userSchema)