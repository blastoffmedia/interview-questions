import express, { Request, Response } from "express";
import { mockContent } from "../mockData";
// TODO: Import the validatePostId middleware

const router = express.Router();

/**
 * GET /api/content/:postId
 *
 * TODO: Apply the validatePostId middleware to this route
 * Hint: router.get('/path', middleware, handler)
 */
router.get("/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const content = mockContent[postId];

  if (!content) {
    return res.status(404).json({ error: "Content not found" });
  }

  return res.json(content);
});

export default router;
