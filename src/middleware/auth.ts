import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import config from "../config";

const auth = (req: Request,res: Response,next: NextFunction) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token required",
            });
        }
        const decoded = jwt.verify(token, config.secret as string);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};

export default auth