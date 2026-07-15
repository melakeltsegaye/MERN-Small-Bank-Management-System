import express from "express";
import {
  applyForLoan, getMyLoans, getLoans, getLoanById,
  reviewLoan, approveLoan, rejectLoan, disburseLoan,
} from "../controllers/loanController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("customer"), applyForLoan);
router.get("/me", authorize("customer"), getMyLoans);
router.get("/", authorize("loan_officer", "manager", "admin"), getLoans);
router.get("/:id", getLoanById);
router.patch("/:id/review", authorize("loan_officer"), reviewLoan);
router.patch("/:id/approve", authorize("manager", "admin"), approveLoan);
router.patch("/:id/reject", authorize("manager", "admin", "loan_officer"), rejectLoan);
router.post("/:id/disburse", authorize("manager", "admin"), disburseLoan);

export default router;
