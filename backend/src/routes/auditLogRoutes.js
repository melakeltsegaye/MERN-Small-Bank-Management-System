import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate, authorize("admin", "manager"));
router.get("/", getAuditLogs);

export default router;
