

import { Router } from "express";
import { searchCompany, getCompanyOverview, getExtendedDashboard } from "../controllers/marketController.js";

const router = Router();

router.get("/search", searchCompany);
router.get("/company/:symbol(*)", getCompanyOverview);
router.get("/dashboard/extended", getExtendedDashboard);

export default router;
