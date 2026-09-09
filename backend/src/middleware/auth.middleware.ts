import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: "participant" | "organizer";
    };
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
        return res.status(401).json({
            message: "Токен авторизації не надано"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number;
            role: "participant" | "organizer";
        };

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Недійсний або прострочений токен"
        });
    }
};

export const requireRole = (
    role: "participant" | "organizer"
) => {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Користувач не авторизований"
            });
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                message: "Недостатньо прав доступу"
            });
        }

        next();
    };
};