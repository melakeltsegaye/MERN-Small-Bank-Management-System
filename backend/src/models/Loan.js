import mongoose from "mongoose";

export const LOAN_TYPES = ["personal", "home", "auto", "education", "business"];
export const LOAN_STATUS = ["pending", "under_review", "approved", "rejected", "disbursed", "active", "closed", "defaulted"];

const loanSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    disbursementAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    loanType: { type: String, enum: LOAN_TYPES, required: true },
    principal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true, min: 1 },
    emiAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    totalPayable: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    outstandingBalance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    status: { type: String, enum: LOAN_STATUS, default: "pending" },
    purpose: { type: String, trim: true, maxlength: 500 },
    documents: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    disbursedAt: { type: Date },
    repaymentSchedule: [
      {
        installmentNumber: Number,
        dueDate: Date,
        emiAmount: mongoose.Schema.Types.Decimal128,
        principalComponent: mongoose.Schema.Types.Decimal128,
        interestComponent: mongoose.Schema.Types.Decimal128,
        status: { type: String, enum: ["upcoming", "paid", "overdue", "missed"], default: "upcoming" },
        paidAt: Date,
        paidTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
      },
    ],
    closedAt: { type: Date },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

loanSchema.index({ applicant: 1, status: 1 });
loanSchema.index({ status: 1, createdAt: -1 });

loanSchema.statics.generateReferenceId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LOAN-${timestamp}-${random}`;
};

loanSchema.methods.calculateEMI = function () {
  const P = parseFloat(this.principal.toString());
  const r = this.interestRate / 12 / 100;
  const n = this.tenureMonths;
  if (r === 0) return P / n;
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi * 100) / 100;
};

export const Loan = mongoose.model("Loan", loanSchema);