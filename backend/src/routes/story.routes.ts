import { Router } from "express";
import multer from "multer";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  createStory,
  getStories,
  getStoryById,
  viewStory,
  deleteStory,
  getStoryViewers,
} from "../controllers/story.controller";
import { upload } from "../services";

const router = Router();

// Public route for viewing individual stories
router.get("/:id", getStoryById);

// Protected routes
router.post("/", authenticateJWT, upload.single("media"), createStory);
router.get("/", authenticateJWT, getStories);
router.post("/:id/view", authenticateJWT, viewStory);
router.delete("/:id", authenticateJWT, deleteStory);
router.get("/:id/viewers", authenticateJWT, getStoryViewers);

export default router;