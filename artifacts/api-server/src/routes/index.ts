import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recruiterRouter from "./recruiter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recruiterRouter);

export default router;
