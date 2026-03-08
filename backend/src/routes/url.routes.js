import { Router } from "express";
import { shortenUrl } from "../controllers/url.controller.js";

const router = Router();

// POST /api/v1/url/shorten
router.route("/shorten").post(shortenUrl);

export default router;