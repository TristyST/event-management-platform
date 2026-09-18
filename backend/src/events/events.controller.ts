import { Response } from "express";
import pool from "../db/database";
import { AuthRequest } from "../middleware/auth.middleware";

const getEventId = (
    req: AuthRequest,
    res: Response
): number | null => {
    const eventId = Number(req.params.id);

    if (Number.isNaN(eventId)) {
        res.status(400).json({
            message: "Недійсний ID заходу"
        });

        return null;
    }

    return eventId;
};

export const createEvent = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const {
            title,
            short_description,
            description,
            event_date,
            event_time,
            location,
            capacity
        } = req.body;

        if (
            !title ||
            !short_description ||
            !description ||
            !event_date ||
            !event_time ||
            !location ||
            !capacity
        ) {
            return res.status(400).json({
                message: "Усі поля є обов'язковими"
            });
        }

        if (Number(capacity) <= 0) {
            return res.status(400).json({
                message: "Кількість місць повинна бути більшою за 0"
            });
        }

        const result = await pool.query(
            `INSERT INTO events (
                title,
                short_description,
                description,
                event_date,
                event_time,
                location,
                organizer_id,
                capacity,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
            RETURNING *`,
            [
                title,
                short_description,
                description,
                event_date,
                event_time,
                location,
                req.user.id,
                capacity
            ]
        );

        res.status(201).json({
            message: "Захід успішно створено",
            event: result.rows[0]
        });
    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const getEvents = async (
    _req: AuthRequest,
    res: Response
) => {
    try {
        const result = await pool.query(
            `SELECT
                e.id,
                e.title,
                e.short_description,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.organizer_id,
                u.name AS organizer_name,
                e.capacity,
                e.status,
                e.created_at
            FROM events e
            JOIN users u ON u.id = e.organizer_id
            WHERE e.status = 'published'
            ORDER BY e.event_date, e.event_time`
        );

        res.json({
            events: result.rows
        });
    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const getEventById = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const eventId = getEventId(req, res);

        if (eventId === null) {
            return;
        }

        const result = await pool.query(
            `SELECT
                e.id,
                e.title,
                e.short_description,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.organizer_id,
                u.name AS organizer_name,
                e.capacity,
                e.status,
                e.created_at
            FROM events e
            JOIN users u ON u.id = e.organizer_id
            WHERE e.id = $1`,
            [eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Захід не знайдено"
            });
        }

        res.json({
            event: result.rows[0]
        });
    } catch (error) {
        console.error("Get event error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const updateEvent = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const eventId = getEventId(req, res);

        if (eventId === null) {
            return;
        }

        const existingEvent = await pool.query(
            "SELECT * FROM events WHERE id = $1",
            [eventId]
        );

        if (existingEvent.rows.length === 0) {
            return res.status(404).json({
                message: "Захід не знайдено"
            });
        }

        const event = existingEvent.rows[0];

        if (event.organizer_id !== req.user.id) {
            return res.status(403).json({
                message: "Ви можете редагувати лише власні заходи"
            });
        }

        const {
            title,
            short_description,
            description,
            event_date,
            event_time,
            location,
            capacity
        } = req.body;

        if (
            !title ||
            !short_description ||
            !description ||
            !event_date ||
            !event_time ||
            !location ||
            !capacity
        ) {
            return res.status(400).json({
                message: "Усі поля є обов'язковими"
            });
        }

        if (Number(capacity) <= 0) {
            return res.status(400).json({
                message: "Кількість місць повинна бути більшою за 0"
            });
        }

        const result = await pool.query(
            `UPDATE events
            SET
                title = $1,
                short_description = $2,
                description = $3,
                event_date = $4,
                event_time = $5,
                location = $6,
                capacity = $7
            WHERE id = $8
            RETURNING *`,
            [
                title,
                short_description,
                description,
                event_date,
                event_time,
                location,
                capacity,
                eventId
            ]
        );

        res.json({
            message: "Захід успішно оновлено",
            event: result.rows[0]
        });
    } catch (error) {
        console.error("Update event error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const publishEvent = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const eventId = getEventId(req, res);

        if (eventId === null) {
            return;
        }

        const existingEvent = await pool.query(
            "SELECT * FROM events WHERE id = $1",
            [eventId]
        );

        if (existingEvent.rows.length === 0) {
            return res.status(404).json({
                message: "Захід не знайдено"
            });
        }

        const event = existingEvent.rows[0];

        if (event.organizer_id !== req.user.id) {
            return res.status(403).json({
                message: "Ви можете публікувати лише власні заходи"
            });
        }

        const result = await pool.query(
            `UPDATE events
            SET status = 'published'
            WHERE id = $1
            RETURNING *`,
            [eventId]
        );

        res.json({
            message: "Захід успішно опубліковано",
            event: result.rows[0]
        });
    } catch (error) {
        console.error("Publish event error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const completeEvent = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        const eventId = getEventId(req, res);

        if (eventId === null) {
            return;
        }

        const existingEvent = await pool.query(
            "SELECT * FROM events WHERE id = $1",
            [eventId]
        );

        if (existingEvent.rows.length === 0) {
            return res.status(404).json({
                message: "Захід не знайдено"
            });
        }

        const event = existingEvent.rows[0];

        if (event.organizer_id !== req.user.id) {
            return res.status(403).json({
                message: "Ви можете завершувати лише власні заходи"
            });
        }

        if (event.status !== "published") {
            return res.status(400).json({
                message: "Завершити можна лише опублікований захід"
            });
        }

        const result = await pool.query(
            `UPDATE events
             SET status = 'completed'
             WHERE id = $1
             RETURNING *`,
            [eventId]
        );

        res.json({
            message: "Захід успішно завершено",
            event: result.rows[0]
        });
    } catch (error) {
        console.error("Complete event error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const getMyEvents = async (
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
                e.id,
                e.title,
                e.short_description,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.capacity,
                e.status,
                e.created_at
            FROM events e
            WHERE e.organizer_id = $1
            ORDER BY e.event_date DESC, e.event_time DESC`,
            [req.user.id]
        );

        res.json({
            events: result.rows
        });
    } catch (error) {
        console.error("Get my events error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};