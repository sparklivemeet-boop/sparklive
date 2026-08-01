import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  getFeed,
  getHomeFeed,
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
import {
  savePost,
  unsavePost,
  getSavedPosts,
  sharePost,
  getPostById,
} from "../controllers/post.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/", getFeed);
router.get("/home", getHomeFeed);
router.get("/trending", getTrendingFeed);
router.get("/explore", getExploreFeed);
router.get("/saved", getSavedPosts);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.post("/:id/like", likePost);
router.post("/:id/share", sharePost);
router.post("/:id/save", savePost);
router.delete("/:id/save", unsavePost);
router.post("/:id/comments", commentOnPost);
router.get("/:id/comments", getPostComments);
router.get("/:id", getPostById);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

export default router;
