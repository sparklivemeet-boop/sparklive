import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { upload, buildUploadUrl } from "../services";
import { uploadFile, uploadMultipleFiles, uploadAvatar, uploadBanner } from "../controllers/upload.controller";

const router = Router();

router.use(authenticateJWT);

router.post("/", upload.single("file"), uploadFile);
router.post("/multiple", upload.array("files", 10), uploadMultipleFiles);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.post("/banner", upload.single("banner"), uploadBanner);

export default router;