import type { Request, Response } from "express";
import { createIssueIntoDB } from "./issue.service";

export const createIssue = async (req: Request,res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user.id;
    const issue = await createIssueIntoDB(title,description,type,reporterId);

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};