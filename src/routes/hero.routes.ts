import { Router } from "express";
import { createHero, getHeroDetail, getHeroes } from "../controllers/hero.controller";

const router = Router();

router.get("/", getHeroes);
router.get("/:hero_id", getHeroDetail);
router.post("/", createHero);

export default router;
