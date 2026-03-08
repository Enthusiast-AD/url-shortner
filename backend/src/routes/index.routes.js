import { Router } from "express";
import { redirectUrl } from "../controllers/url.controller.js";

const router = Router();

// Route to handle redirection
// This usually sits at the root (GET /:shortId)
router.route("/:shortId").get(redirectUrl);

export default router;