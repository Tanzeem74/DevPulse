import express from "express";
import auth from "../../middleware/auth";
import { issueController } from "./issue.controller";

const router = express.Router();

router.post("/", auth, issueController.createIssue);
router.get("/", issueController.getIssues);

export const issueRoute = router;