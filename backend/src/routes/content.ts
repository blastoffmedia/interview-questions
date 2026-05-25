import express, { Request, Response } from "express";
import { listContent } from "../services/content-service";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  // Simulate variable network latency.
  const delay = 200 + Math.floor(Math.random() * 600);
  await new Promise(resolve => setTimeout(resolve, delay));

  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;

  const result = listContent({ category, page, pageSize });
  return res.json(result);
});

export default router;
