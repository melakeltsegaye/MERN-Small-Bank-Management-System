import mongoose from "mongoose";
import crypto from "crypto";

export const ACCOUNT_TYPES = ["savings", "current", "fixed_deposit"];
export const ACCOUNT_STATUS = ["active", "frozen", "closed"];

const accountSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true, unique: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accountType: { type: String, enum: ACCOUNT_TYPES, required: true, default: "savings" },
    balance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    currency: { type: String, default: "Birr" },
    status: { type: String, enum: ACCOUNT_STATUS, default: "active" },
    minimumBalance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    interestRate: { type: Number, default: 0 },
    withdrawalLimitPerDay: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
      get: (v) => (v ? parseFloat(v.toString()) : null),
    },
    maturityDate: { type: Date },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closedAt: { type: Date },
    version: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

accountSchema.index({ owner: 1, status: 1 });

accountSchema.statics.generateAccountNumber = function () {
  return crypto.randomInt(1000000000, 9999999999).toString();
};

accountSchema.methods.canWithdraw = function (amount) {
  const currentBalance = parseFloat(this.balance.toString());
  const min = parseFloat(this.minimumBalance.toString());
  return this.status === "active" && currentBalance - amount >= min;
};

export const Account = mongoose.model("Account", accountSchema);