import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { storyService, upload, buildUploadUrl } from "../services";

export const createStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    if (!req.file) { res.status(400).json({ error: "Media file is required" }); return; }

    const url = buildUploadUrl(req, req.file.filename);
    const mediaType = req.file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGE";
    const caption = typeof req.body.caption === "string" ? req.body.caption.trim() : undefined;

    const story = await storyService.createStory(userId, url, mediaType, caption);
    res.status(201).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(400).json({ error: message });
  }
};

export const getStories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const stories = await storyService.getActiveStories(userId);
    res.status(200).json(stories);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(400).json({ error: message });
  }
};

export const getStoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const story = await storyService.getStoryById(req.params.id);
    if (!story) { res.status(404).json({ error: "Story not found" }); return; }
    res.status(200).json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(400).json({ error: message });
  }
};

export const viewStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const result = await storyService.viewStory(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(400).json({ error: message });
  }
};

export const deleteStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    await storyService.deleteStory(req.params.id, userId);
    res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(400).json({ error: message });
  }
};

export const getStoryViewers = async (req: Request, res: Response): Promise<void> => {
  try {
    const viewers = await storyService.getStoryViewers(req.params.id);
    res.status(200).json(viewers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(400).json({ error: message });
  }
};