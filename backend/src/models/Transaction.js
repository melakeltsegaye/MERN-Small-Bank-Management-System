import mongoose from "mongoose";

export const TRANSACTION_TYPES = ["deposit", "withdrawal", "transfer_in", "transfer_out", "loan_disbursement", "loan_repayment"];
export const TRANSACTION_STATUS = ["pending", "completed", "failed", "reversed"];
export const TRANSACTION_CHANNELS = ["branch", "online", "atm", "system"];

const transactionSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    balanceAfter: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: TRANSACTION_STATUS, default: "completed" },
    relatedAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, enum: TRANSACTION_CHANNELS, default: "online" },
    description: { type: String, trim: true, maxlength: 250 },
    reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
    isReversal: { type: Boolean, default: false },
    originalTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
    ipAddress: { type: String },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

transactionSchema.index({ account: 1, createdAt: -1 });
transactionSchema.index({ performedBy: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

transactionSchema.statics.generateReferenceId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const Transaction = mongoose.model("Transaction", transactionSchema);