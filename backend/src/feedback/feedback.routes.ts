import { Router } from "express";

import {
    authenticateToken,
    requireRole
} from "../middleware/auth.middleware";

import {
    createFeedback,
    getEventFeedback
} from "./feedback.controller";

const router = Router();

router.post(
    "/:id",
    authenticateToken,
    requireRole("participant"),
    createFeedback
);

router.get(
    "/event/:id",
    authenticateToken,
    requireRole("organizer"),
    getEventFeedback
);

export default router;