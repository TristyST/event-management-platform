import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";

import pool from "./db/database";

import authRoutes from "./auth/auth.routes";
import eventsRoutes from "./events/events.routes";
import registrationsRoutes from "./registrations/registrations.routes";
import feedbackRoutes from "./feedback/feedback.routes";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const corsOptions: CorsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/registrations", registrationsRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok"
    });
});

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

app.listen(PORT, () => {
    console.log(
        `Backend server is running on http://localhost:${PORT}`
    );
});