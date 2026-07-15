import express from "express";
import {
  createStaffUser, getUsers, getUserById, updateUserRole, updateUserStatus,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("admin"), createStaffUser);
router.get("/", authorize("admin", "manager"), getUsers);
router.get("/:id", authorize("admin", "manager"), getUserById);
router.patch("/:id/role", authorize("admin"), updateUserRole);
router.patch("/:id/status", authorize("admin", "manager"), updateUserStatus);

export default router;
