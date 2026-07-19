import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getProfile,
  updateProfile,
  getDiscoverProfiles,
  uploadAvatar,
  uploadBanner,
  uploadProfileMedia,
  getProfilePosts,
  getProfileMedia,
  getProfileReplies,
  getProfileLikes,
  getPublicProfile,
  getPublicProfilePosts,
  getPublicProfileMedia,
  followUser,
  unfollowUser,
} from '../controllers/profile.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const uploadDir = path.resolve(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image\/jpeg|image\/png|image\/webp)$/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WEBP images are allowed'));
    }
  },
});

router.get('/public/:username', getPublicProfile);
router.get('/public/:username/posts', getPublicProfilePosts);
router.get('/public/:username/media', getPublicProfileMedia);

router.use(authenticateJWT);

router.get('/me', getProfile);
router.get('/me/posts', getProfilePosts);
router.get('/me/media', getProfileMedia);
router.get('/me/replies', getProfileReplies);
router.get('/me/likes', getProfileLikes);
router.put('/me', updateProfile);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.post('/me/banner', upload.single('banner'), uploadBanner);
router.post('/me/media', upload.single('media'), uploadProfileMedia);
router.post('/:username/follow', followUser);
router.delete('/:username/follow', unfollowUser);
router.get('/discover', getDiscoverProfiles);

export default router;
