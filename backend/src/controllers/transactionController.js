import { performDeposit, performWithdrawal, performTransfer } from "../services/transactionService.js";
import { Transaction } from "../models/Transaction.js";
import { Account } from "../models/Account.js";
import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertOwnershipOrStaff = async (req, accountId) => {
  if (req.user.role !== "customer") return;
  const account = await Account.findById(accountId);
  if (!account || account.owner.toString() !== req.user.id) {
    const err = new Error("Not authorized to act on this account");
    err.statusCode = 403;
    throw err;
  }
};

export const deposit = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const accountId = req.params.id;
  await assertOwnershipOrStaff(req, accountId);

  const channel = req.user.role === "customer" ? "online" : "branch";
  const result = await performDeposit({ accountId, amount, performedBy: req.user.id, channel, description });

  await AuditLog.create({
    action: "deposit",
    performedBy: req.user.id,
    targetType: "Transaction",
    targetId: result.transaction._id,
    description: `Deposited ${amount} to account ${accountId}`,
  });

  res.status(200).json({ success: true, ...result });
});

export const withdraw = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const accountId = req.params.id;
  await assertOwnershipOrStaff(req, accountId);

  const channel = req.user.role === "customer" ? "online" : "branch";
  const result = await performWithdrawal({ accountId, amount, performedBy: req.user.id, channel, description });

  await AuditLog.create({
    action: "withdrawal",
    performedBy: req.user.id,
    targetType: "Transaction",
    targetId: result.transaction._id,
    description: `Withdrew ${amount} from account ${accountId}`,
  });

  res.status(200).json({ success: true, ...result });
});

export const transfer = asyncHandler(async (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  await assertOwnershipOrStaff(req, fromAccountId);

  const result = await performTransfer({ fromAccountId, toAccountId, amount, performedBy: req.user.id, description });

  await AuditLog.create({
    action: "transfer",
    performedBy: req.user.id,
    targetType: "Transaction",
    targetId: result.outTxn._id,
    description: `Transferred ${amount} from ${fromAccountId} to ${toAccountId}`,
  });

  res.status(200).json({ success: true, ...result });
});

export const getAccountTransactions = asyncHandler(async (req, res) => {
  const accountId = req.params.id;
  const { page = 1, limit = 20 } = req.query;
  await assertOwnershipOrStaff(req, accountId);

  const transactions = await Transaction.find({ account: accountId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Transaction.countDocuments({ account: accountId });
  res.status(200).json({ success: true, count: transactions.length, total, transactions });
});
