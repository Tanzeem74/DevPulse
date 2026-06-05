import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user.id;
    const issue = await issueService.createIssueIntoDB(title, description, type, reporterId);

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

const getIssues = async (req: Request, res: Response) => {
  try {
    const issues = await issueService.getIssuesFromDB(req.query);

    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const issue = await issueService.getSingleIssueFromDB(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: issue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    const issue = await issueService.getIssueById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    const user = req.user;
    if (user.role !== "maintainer") {
      if (issue.reporter_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }
      if (issue.status !== "open") {
        return res.status(403).json({
          success: false,
          message: "Issue can no longer be updated",
        });
      }
    }
    const { title, description, type } = req.body;
    const updatedIssue = await issueService.updateIssueInDB(issueId, title, description, type);
    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const issueController = {
  createIssue,
  getIssues,
  getSingleIssue,
  updateIssue
}