import { Router } from "express";
import healthRouter from "./health";
import recruiterRouter from "./recruiter";

const router = Router();

router.use(healthRouter);
router.use(recruiterRouter);

export default router;