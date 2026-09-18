import { Response } from "express";
import { PoolClient } from "pg";
import pool from "../db/database";
import { AuthRequest } from "../middleware/auth.middleware";

const rollbackWithError = async (
    client: PoolClient,
    res: Response,
    statusCode: number,
    message: string
) => {
    await client.query("ROLLBACK");

    return res.status(statusCode).json({
        message
    });
};

export const registerForEvent = async (
    req: AuthRequest,
    res: Response
) => {
    const client = await pool.connect();

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

        await client.query("BEGIN");

        const eventResult = await client.query(
            `SELECT id, capacity, status
             FROM events
             WHERE id = $1
             FOR UPDATE`,
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            return rollbackWithError(
                client,
                res,
                404,
                "Захід не знайдено"
            );
        }

        const event = eventResult.rows[0];

        if (event.status !== "published") {
            return rollbackWithError(
                client,
                res,
                400,
                "Реєстрація доступна лише на опубліковані заходи"
            );
        }

        const existingRegistration = await client.query(
            `SELECT id
             FROM registrations
             WHERE user_id = $1 AND event_id = $2`,
            [req.user.id, eventId]
        );

        if (existingRegistration.rows.length > 0) {
            return rollbackWithError(
                client,
                res,
                409,
                "Ви вже зареєстровані на цей захід"
            );
        }

        const countResult = await client.query(
            `SELECT COUNT(*)::int AS count
             FROM registrations
             WHERE event_id = $1`,
            [eventId]
        );

        const registeredCount = countResult.rows[0].count;

        if (registeredCount >= event.capacity) {
            return rollbackWithError(
                client,
                res,
                409,
                "Вільних місць на захід більше немає"
            );
        }

        const registrationResult = await client.query(
            `INSERT INTO registrations (user_id, event_id)
             VALUES ($1, $2)
             RETURNING *`,
            [req.user.id, eventId]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Реєстрація на захід успішна",
            registration: registrationResult.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Register for event error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    } finally {
        client.release();
    }
};

export const getMyRegistrations = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const result = await pool.query(
            `SELECT
                r.id,
                r.registered_at,
                e.id AS event_id,
                e.title,
                e.short_description,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.capacity,
                e.status,
                u.name AS organizer_name
            FROM registrations r
            JOIN events e ON e.id = r.event_id
            JOIN users u ON u.id = e.organizer_id
            WHERE r.user_id = $1
            ORDER BY e.event_date, e.event_time`,
            [req.user.id]
        );

        res.json({
            registrations: result.rows
        });
    } catch (error) {
        console.error("Get my registrations error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const getEventRegistrations = async (
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
            `SELECT id, title, organizer_id, capacity
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
                message: "Ви можете переглядати учасників лише власних заходів"
            });
        }

        const result = await pool.query(
            `SELECT
                r.id,
                r.registered_at,
                u.id AS user_id,
                u.name,
                u.email
            FROM registrations r
            JOIN users u ON u.id = r.user_id
            WHERE r.event_id = $1
            ORDER BY r.registered_at`,
            [eventId]
        );

        res.json({
            event: {
                id: event.id,
                title: event.title,
                capacity: event.capacity,
                registered_count: result.rows.length
            },
            participants: result.rows
        });
    } catch (error) {
        console.error("Get event registrations error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};