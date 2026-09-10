import { Router } from "express";

import {
    authenticateToken,
    requireRole
} from "../middleware/auth.middleware";

import {
    registerForEvent,
    getMyRegistrations,
    getEventRegistrations
} from "./registrations.controller";

const router = Router();

router.get(
    "/my",
    authenticateToken,
    requireRole("participant"),
    getMyRegistrations
);

router.get(
    "/event/:id",
    authenticateToken,
    requireRole("organizer"),
    getEventRegistrations
);

router.post(
    "/:id",
    authenticateToken,
    requireRole("participant"),
    registerForEvent
);

export default router;