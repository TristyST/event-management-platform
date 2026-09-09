import express from "express";
import dotenv from "dotenv";

import pool from "./db/database";

import authRoutes from "./auth/auth.routes";
import eventsRoutes from "./events/events.routes";
import registrationsRoutes from "./registrations/registrations.routes";
import feedbackRoutes from "./feedback/feedback.routes";

import {
    authenticateToken,
    requireRole,
    AuthRequest
} from "./middleware/auth.middleware";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/registrations", registrationsRoutes);
app.use("/api/feedback", feedbackRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok"
    });
});

// Database health check
app.get("/api/health/db", async (_req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "ok",
            database: "connected",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

// Temporary JWT test
app.get(
    "/api/test-auth",
    authenticateToken,
    (req: AuthRequest, res) => {
        res.json({
            message: "Авторизація працює",
            user: req.user
        });
    }
);

// Temporary organizer role test
app.get(
    "/api/test-organizer",
    authenticateToken,
    requireRole("organizer"),
    (req: AuthRequest, res) => {
        res.json({
            message: "Доступ організатора дозволено",
            user: req.user
        });
    }
);

app.listen(PORT, () => {
    console.log(
        `Backend server is running on http://localhost:${PORT}`
    );
});