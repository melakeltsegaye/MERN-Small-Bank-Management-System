import { Loan } from "../models/Loan.js";
import { performDeposit } from "../services/transactionService.js";
import { buildRepaymentSchedule } from "../services/loanService.js";
import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const applyForLoan = asyncHandler(async (req, res) => {
  const { disbursementAccount, loanType, principal, interestRate, tenureMonths, purpose } = req.body;

  const loan = await Loan.create({
    referenceId: Loan.generateReferenceId(),
    applicant: req.user.id,
    disbursementAccount,
    loanType,
    principal,
    interestRate,
    tenureMonths,
    purpose,
    status: "pending",
  });

  await AuditLog.create({ action: "loan_applied", performedBy: req.user.id, targetType: "Loan", targetId: loan._id });

  res.status(201).json({ success: true, loan });
});

export const getMyLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ applicant: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: loans.length, loans });
});

export const getLoans = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const loans = await Loan.find(filter)
    .populate("applicant", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Loan.countDocuments(filter);
  res.status(200).json({ success: true, count: loans.length, total, loans });
});

export const getLoanById = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id).populate("applicant", "name email");
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  if (req.user.role === "customer" && loan.applicant._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to view this loan");
  }
  res.status(200).json({ success: true, loan });
});

export const reviewLoan = asyncHandler(async (req, res) => {
  const { decision, notes } = req.body;

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  if (loan.status !== "pending") {
    res.status(400);
    throw new Error("Loan is not in a reviewable state");
  }

  loan.reviewedBy = req.user.id;
  loan.reviewedAt = new Date();
  loan.reviewNotes = notes;
  loan.status = decision === "approve" ? "under_review" : "rejected";
  if (decision !== "approve") loan.rejectionReason = notes;

  await loan.save();

  await AuditLog.create({
    action: "loan_reviewed",
    performedBy: req.user.id,
    targetType: "Loan",
    targetId: loan._id,
    changes: { after: { status: loan.status } },
  });

  res.status(200).json({ success: true, loan });
});

export const approveLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  if (loan.status !== "under_review") {
    res.status(400);
    throw new Error("Loan must be under review before final approval");
  }

  const emi = loan.calculateEMI();
  loan.emiAmount = emi;
  loan.totalPayable = Math.round(emi * loan.tenureMonths * 100) / 100;
  loan.outstandingBalance = loan.totalPayable;
  loan.repaymentSchedule = buildRepaymentSchedule(loan);
  loan.approvedBy = req.user.id;
  loan.approvedAt = new Date();
  loan.status = "approved";

  await loan.save();

  await AuditLog.create({ action: "loan_approved", performedBy: req.user.id, targetType: "Loan", targetId: loan._id });

  res.status(200).json({ success: true, loan });
});

export const rejectLoan = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }

  loan.status = "rejected";
  loan.rejectionReason = reason;
  await loan.save();

  await AuditLog.create({ action: "loan_rejected", performedBy: req.user.id, targetType: "Loan", targetId: loan._id });

  res.status(200).json({ success: true, loan });
});

export const disburseLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  if (loan.status !== "approved") {
    res.status(400);
    throw new Error("Loan must be approved before disbursement");
  }

  const principal = parseFloat(loan.principal.toString());

  const { transaction } = await performDeposit({
    accountId: loan.disbursementAccount,
    amount: principal,
    performedBy: req.user.id,
    channel: "system",
    description: `Loan disbursement for ${loan.referenceId}`,
  });

  loan.status = "active";
  loan.disbursedAt = new Date();
  await loan.save();

  await AuditLog.create({ action: "loan_disbursed", performedBy: req.user.id, targetType: "Loan", targetId: loan._id });

  res.status(200).json({ success: true, loan, transaction });
});
