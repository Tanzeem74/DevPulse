import { pool } from "../../db";

export const createUser = async (name: string, email: string, password: string, role: string) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at`,
        [name, email, password, role || "contributor"]
    );

    return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    return result.rows[0];
};