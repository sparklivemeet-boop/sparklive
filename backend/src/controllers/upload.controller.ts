import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { uploadService, buildUploadUrl, getFileType } from "../services";

export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    if (!req.file) { res.status(400).json({ error: "File is required" }); return; }

    const result = await uploadService.uploadFile(req, req.file);
    res.status(201).json({ message: "File uploaded successfully", ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    res.status(400).json({ error: message });
  }
};

export const uploadMultipleFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const results = await Promise.all(
      files.map(file => uploadService.uploadFile(req, file))
    );

    res.status(201).json({ message: "Files uploaded successfully", files: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    res.status(400).json({ error: message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    if (!req.file) { res.status(400).json({ error: "Avatar file is required" }); return; }

    const url = buildUploadUrl(req, req.file.filename);
    const { userService } = await import("../services");
    const profile = await userService.updateProfileImage(userId, "avatar", url);

    res.status(200).json({ message: "Avatar updated successfully", url, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar upload failed";
    res.status(400).json({ error: message });
  }
};

export const uploadBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    if (!req.file) { res.status(400).json({ error: "Banner file is required" }); return; }

    const url = buildUploadUrl(req, req.file.filename);
    const { userService } = await import("../services");
    const profile = await userService.updateProfileImage(userId, "banner", url);

    res.status(200).json({ message: "Banner updated successfully", url, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Banner upload failed";
    res.status(400).json({ error: message });
  }
};