import { User, ROLES } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, branch, employeeId } = req.body;

  if (!ROLES.includes(role) || role === "customer") {
    res.status(400);
    throw new Error("Invalid staff role");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({
    name, email, password, role, branch, employeeId,
    hiredAt: new Date(),
    createdBy: req.user.id,
  });

  await AuditLog.create({
    action: "user_created",
    performedBy: req.user.id,
    targetType: "User",
    targetId: user._id,
    description: `Created staff account with role '${role}'`,
  });

  res.status(201).json({ success: true, user: user.toSafeObject() });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { role, branch, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (branch) filter.branch = branch;
  if (status) filter.status = status;

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    users: users.map((u) => u.toSafeObject()),
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const before = user.role;
  user.role = role;
  await user.save();

  await AuditLog.create({
    action: "user_role_changed",
    performedBy: req.user.id,
    targetType: "User",
    targetId: user._id,
    changes: { before: { role: before }, after: { role } },
  });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended", "deactivated"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const before = user.status;
  user.status = status;
  if (status !== "active") user.refreshTokens = [];
  await user.save();

  await AuditLog.create({
    action: "user_suspended",
    performedBy: req.user.id,
    targetType: "User",
    targetId: user._id,
    changes: { before: { status: before }, after: { status } },
  });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});
