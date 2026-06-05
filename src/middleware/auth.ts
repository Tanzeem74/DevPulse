import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import config from "../config";
import { pool } from "../db";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token required",
            });
        }
        const decoded = jwt.verify(token,config.secret as string) as JwtPayload;
        const userResult = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [decoded.id]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        req.user = userResult.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};

export default auth