import express from "express"
import {register} from "../controllers/authController.js"
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/authenticate.js";

const authRoute = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts, please try again later" },
});

authRoute.post("/register", register),
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default authRoute;