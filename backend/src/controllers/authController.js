import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { AuditLog } from "../models/AuditLog.js";

// signup controller 
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

export const register = asyncHandler( async(req, res) => {
    const {name, email, password, phone} = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error("name, email and pasword are required")
    }

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

if (!PASSWORD_REGEX.test(password)) {
  res.status(400);
  throw new Error(
    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character"
  );
}

const exist = await User.findOne({ email })

if(exist) {
    res.status(400)
    throw new Error("an account with this email already exist")
}

const user = await User.create({ name, email, password, phone, role: "customer"})

res.status(201).json({message: "rejesterd successfuly", success: true, user: user.toSafeObject()})
})

// login controller

export const login = asyncHandler(async (req, res) => {
  const {email, password} = req.body

  if(!email || !password) {
    res.status(400)
    throw new Error("Email and Password are required")
  }

  const user = User.findOne({email}).select("+password")

  if(!user) {
    res.status(401)
    throw new Error("Invalid credential")
  }
  
  if(user.isLocked) {
    res.status(423);
    throw new Error("Account Temporarily Locked due to falid login attempts. try again later.")
  }

  const match = await user.comparePassword(password)
  if(!match) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
    await user.save();

    await AuditLog.create({
      action: "user_login_failed",
      performedBy: user._id,
      status: "failure",
      ipAddress: req.ip,
      description: `Failed login attempt for ${email}`,
    });

    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.status !== "active") {
    res.status(403);
    throw new Error("This account is not active. Contact support.");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();
  setRefreshCookie(res, refreshToken);

  await AuditLog.create({ action: "user_login", performedBy: user._id, ipAddress: req.ip });

  res.status(200).json({ success: true, accessToken, user: user.toSafeObject() });
})


// generates access token controller

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const storedToken = user.refreshTokens.find((rt) => rt.token === token);
  if (!storedToken) {
    res.status(401);
    throw new Error("Refresh token not recognized, please log in again");
  }

  const newAccessToken = generateAccessToken(user);
  res.status(200).json({ success: true, accessToken: newAccessToken });
});


// log out controller

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token && req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { $pull: { refreshTokens: { token } } });
  }
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logged out" });
});

// get user data controller 

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, user: user.toSafeObject() });
});