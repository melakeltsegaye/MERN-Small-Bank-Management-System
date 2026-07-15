import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== "active") {
    res.status(401);
    throw new Error("Not authorized, user not found or inactive");
  }

  req.user = { id: user._id.toString(), role: user.role };
  next();
});
