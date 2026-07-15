import express from "express";
import {
  openAccount, getMyAccounts, getAccountById, getAccounts, updateAccountStatus,
} from "../controllers/accoutnController.js";
import { deposit, withdraw, getAccountTransactions } from "../controllers/transactionController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("employee", "manager", "admin"), openAccount);
router.get("/me", getMyAccounts);
router.get("/", authorize("employee", "loan_officer", "manager", "admin"), getAccounts);
router.get("/:id", getAccountById);
router.patch("/:id/status", authorize("employee", "manager", "admin"), updateAccountStatus);

router.post("/:id/deposit", deposit);
router.post("/:id/withdraw", withdraw);
router.get("/:id/transactions", getAccountTransactions);

export default router;
