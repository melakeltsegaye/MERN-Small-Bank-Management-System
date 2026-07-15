import mongoose from "mongoose";

export const AUDIT_ACTIONS = [
  "user_login", "user_login_failed", "user_logout", "user_created", "user_updated",
  "user_role_changed", "user_suspended", "account_opened", "account_frozen", "account_closed",
  "deposit", "withdrawal", "transfer", "transaction_reversed", "loan_applied", "loan_reviewed",
  "loan_approved", "loan_rejected", "loan_disbursed", "settings_changed",
];

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: { type: String, enum: ["User", "Account", "Transaction", "Loan"] },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    changes: { before: mongoose.Schema.Types.Mixed, after: mongoose.Schema.Types.Mixed },
    description: { type: String, trim: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ["success", "failure"], default: "success" },
  },
  { timestamps: true }
);

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
