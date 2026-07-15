import { Account } from "../models/Account.js";
import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const openAccount = asyncHandler(async (req, res) => {
  const { owner, accountType, branch, minimumBalance, interestRate } = req.body;

  const account = await Account.create({
    accountNumber: Account.generateAccountNumber(),
    owner,
    accountType,
    branch,
    minimumBalance: minimumBalance || 0,
    interestRate: interestRate || 0,
    openedBy: req.user.id,
  });

  await AuditLog.create({
    action: "account_opened",
    performedBy: req.user.id,
    targetType: "Account",
    targetId: account._id,
  });

  res.status(201).json({ success: true, account });
});

export const getMyAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ owner: req.user.id });
  res.status(200).json({ success: true, count: accounts.length, accounts });
});

export const getAccountById = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Account not found");
  }
  if (req.user.role === "customer" && account.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to view this account");
  }
  res.status(200).json({ success: true, account });
});

export const getAccounts = asyncHandler(async (req, res) => {
  const { owner, branch, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (owner) filter.owner = owner;
  if (branch) filter.branch = branch;
  if (status) filter.status = status;

  const accounts = await Account.find(filter)
    .populate("owner", "name email")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Account.countDocuments(filter);
  res.status(200).json({ success: true, count: accounts.length, total, accounts });
});

export const updateAccountStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["active", "frozen", "closed"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Account not found");
  }

  const before = account.status;
  account.status = status;
  if (status === "closed") account.closedAt = new Date();
  await account.save();

  await AuditLog.create({
    action: status === "closed" ? "account_closed" : "account_frozen",
    performedBy: req.user.id,
    targetType: "Account",
    targetId: account._id,
    changes: { before: { status: before }, after: { status } },
  });

  res.status(200).json({ success: true, account });
});