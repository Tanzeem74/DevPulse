import express from "express";
import auth from "../../middleware/auth";
import { createIssue } from "./issue.controller";

const router = express.Router();

router.post("/", auth, createIssue);

export const issueRoute = router;