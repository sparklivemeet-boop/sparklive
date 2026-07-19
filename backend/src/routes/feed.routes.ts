import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  getFeed,
  getTrendingFeed,
  getExploreFeed,
  createPost,
  deletePost,
  likePost,
  commentOnPost,
  getPostComments,
  getFollowers,
  getFollowing,
} from "../controllers/feed.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/", getFeed);
router.get("/trending", getTrendingFeed);
router.get("/explore", getExploreFeed);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.post("/:id/like", likePost);
router.post("/:id/comments", commentOnPost);
router.get("/:id/comments", getPostComments);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

export default router;