import { pool } from "../../db";
const createIssueIntoDB = async (title: string, description: string, type: string, reporterId: number
) => {
    const result = await pool.query(
        `INSERT INTO issues(title,description,type,reporter_id)
        VALUES ($1,$2,$3,$4)
        RETURNING *`, [title, description, type, reporterId]
    );
    return result.rows[0];
};

const getIssuesFromDB = async (query: any) => {
    let baseQuery = `SELECT * FROM issues`;
    const conditions: string[] = [];
    const values: any[] = [];
    let index = 1;
    if (query.type) {
        conditions.push(`type = $${index}`);
        values.push(query.type);
        index++;
    }
    if (query.status) {
        conditions.push(`status = $${index}`);
        values.push(query.status);
        index++;
    }
    if (conditions.length > 0) {
        baseQuery += ` WHERE ` + conditions.join(" AND ");
    }
    if (query.sort === "oldest") {
        baseQuery += ` ORDER BY created_at ASC`;
    } else {
        baseQuery += ` ORDER BY created_at DESC`;
    }
    
    const result = await pool.query(baseQuery, values);
    return result.rows;
};

export const issueService = {
    createIssueIntoDB,
    getIssuesFromDB
}