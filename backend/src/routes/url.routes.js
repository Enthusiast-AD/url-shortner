import { Router } from "express";
import { shortenUrl, deleteUrl } from "../controllers/url.controller.js";

const router = Router();

// POST /api/v1/url/shorten
router.route("/shorten").post(shortenUrl);

// DELETE /api/v1/url/:shortId
router.route("/:shortId").delete(deleteUrl);

export default router;