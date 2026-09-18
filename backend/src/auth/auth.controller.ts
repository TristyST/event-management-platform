import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/database";

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";

const INVALID_CREDENTIALS_MESSAGE = "Неправильний email або пароль";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Усі поля є обов'язковими"
            });
        }

        if (!["participant", "organizer"].includes(role)) {
            return res.status(400).json({
                message: "Недійсна роль"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Користувач з таким email вже існує"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, passwordHash, role]
        );

        res.status(201).json({
            message: "Користувача успішно зареєстровано",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email та пароль є обов'язковими"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: INVALID_CREDENTIALS_MESSAGE
            });
        }

        const user = result.rows[0];

        const passwordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: INVALID_CREDENTIALS_MESSAGE
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Вхід успішний",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Помилка сервера"
        });
    }
};