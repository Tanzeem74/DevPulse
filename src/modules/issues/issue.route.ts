import express from "express";
import auth from "../../middleware/auth";
import { issueController } from "./issue.controller";

const router = express.Router();

router.post("/", auth, issueController.createIssue);
router.get("/", issueController.getIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", auth, issueController.updateIssue);
router.delete("/:id", auth, issueController.deleteIssue);

export const issueRoute = router;