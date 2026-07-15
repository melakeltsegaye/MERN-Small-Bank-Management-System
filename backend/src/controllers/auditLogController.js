import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, performedBy, page = 1, limit = 30 } = req.query;

  const filter = {};
  if (action) filter.action = action;
  if (performedBy) filter.performedBy = performedBy;

  const logs = await AuditLog.find(filter)
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await AuditLog.countDocuments(filter);

  res.status(200).json({ success: true, count: logs.length, total, logs });
});
