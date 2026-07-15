import express from "express";
import { transfer } from "../controllers/transactionController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);
router.post("/transfer", transfer);

export default router;
