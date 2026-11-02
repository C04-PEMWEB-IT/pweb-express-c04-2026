import { Router } from "express";
import { getSkinDetail, getSkins } from "../controllers/skin.controller";

const router = Router();

router.get("/", getSkins);
router.get("/:skin_id", getSkinDetail);

export default router;
