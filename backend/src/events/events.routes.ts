import { Router } from "express";

import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    publishEvent,
    completeEvent,
    getMyEvents
} from "./events.controller";

import {
    authenticateToken,
    requireRole
} from "../middleware/auth.middleware";

const router = Router();

router.get(
    "/my",
    authenticateToken,
    requireRole("organizer"),
    getMyEvents
);

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post(
    "/",
    authenticateToken,
    requireRole("organizer"),
    createEvent
);

router.put(
    "/:id",
    authenticateToken,
    requireRole("organizer"),
    updateEvent
);

router.post(
    "/:id/publish",
    authenticateToken,
    requireRole("organizer"),
    publishEvent
);

router.post(
    "/:id/complete",
    authenticateToken,
    requireRole("organizer"),
    completeEvent
);

export default router;