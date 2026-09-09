import { Response } from "express";
import pool from "../db/database";
import { AuthRequest } from "../middleware/auth.middleware";

export const createFeedback = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const eventId = Number(req.params.id);
        const { rating, comment } = req.body;

        if (Number.isNaN(eventId)) {
            return res.status(400).json({
                message: "Недійсний ID заходу"
            });
        }

        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                message: "Оцінка повинна бути від 1 до 5"
            });
        }

        const eventResult = await pool.query(
            `SELECT id, status
             FROM events
             WHERE id = $1`,
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({
                message: "Захід не знайдено"
            });
        }

        if (eventResult.rows[0].status !== "completed") {
            return res.status(400).json({
                message: "Відгук можна залишити лише після завершення заходу"
            });
        }

        const registrationResult = await pool.query(
            `SELECT id
             FROM registrations
             WHERE user_id = $1 AND event_id = $2`,
            [req.user.id, eventId]
        );

        if (registrationResult.rows.length === 0) {
            return res.status(403).json({
                message: "Залишити відгук можуть лише учасники заходу"
            });
        }

        const existingFeedback = await pool.query(
            `SELECT id
             FROM feedback
             WHERE user_id = $1 AND event_id = $2`,
            [req.user.id, eventId]
        );

        if (existingFeedback.rows.length > 0) {
            return res.status(409).json({
                message: "Ви вже залишили відгук на цей захід"
            });
        }

        const result = await pool.query(
            `INSERT INTO feedback (
                user_id,
                event_id,
                rating,
                comment
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                req.user.id,
                eventId,
                Number(rating),
                comment || null
            ]
        );

        res.status(201).json({
            message: "Відгук успішно додано",
            feedback: result.rows[0]
        });
    } catch (error) {
        console.error("Create feedback error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const getEventFeedback = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const eventId = Number(req.params.id);

        if (Number.isNaN(eventId)) {
            return res.status(400).json({
                message: "Недійсний ID заходу"
            });
        }

        const eventResult = await pool.query(
            `SELECT id, title, organizer_id
             FROM events
             WHERE id = $1`,
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({
                message: "Захід не знайдено"
            });
        }

        const event = eventResult.rows[0];

        if (event.organizer_id !== req.user.id) {
            return res.status(403).json({
                message: "Ви можете переглядати відгуки лише до власних заходів"
            });
        }

        const result = await pool.query(
            `SELECT
                f.id,
                f.rating,
                f.comment,
                f.created_at,
                u.id AS user_id,
                u.name AS user_name
            FROM feedback f
            JOIN users u ON u.id = f.user_id
            WHERE f.event_id = $1
            ORDER BY f.created_at DESC`,
            [eventId]
        );

        res.json({
            event: {
                id: event.id,
                title: event.title
            },
            feedback: result.rows
        });
    } catch (error) {
        console.error("Get event feedback error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};