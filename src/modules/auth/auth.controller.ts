import { createUser, findUserByEmail } from "./auth.service";
import { hashPassword, comparePassword, generateToken } from "../../utils/auth.utils";
import type { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const exist = await findUserByEmail(email);
        if (exist) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }
        const hashedPassword = await hashPassword(password);
        const user = await createUser(name, email, hashedPassword, role);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = generateToken({
            id: user.id,
            name: user.name,
            role: user.role,
        });
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
            },
        });
    } catch (err) {
        //console.error("LOGIN ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};