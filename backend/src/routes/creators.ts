import express, { Request, Response } from "express";
import { mockCreators } from "../mockData";

const router = express.Router();

/**
 * GET /api/creators/:username
 *
 * TODO: Apply the validateUsername middleware to this route
 * Hint: router.get('/path', middleware, handler)
 */
router.get("/:username", async (req: Request, res: Response) => {
  const { username } = req.params;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const creator = mockCreators[username];

  if (!creator) {
    return res.status(404).json({ error: "Creator not found" });
  }

  return res.json(creator);
});

export default router;
