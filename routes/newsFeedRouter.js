const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const newsFeedController = require("../controllers/newsFeedController");
const limiter = require("../middleware/throttleservice");


router.post("/createNewsFeed", limiter, auth, newsFeedController.addNewsFeed);
router.put("/updateNewsFeed/:id", limiter, auth, newsFeedController.updateNewsFeed);
router.delete("/deleteNewsFeed/:id", limiter, auth, newsFeedController.deleteNewsFeed);
router.get("/getNewsFeed", auth, limiter, newsFeedController.getNewsFeed);
router.get("/getNewsFeedById/:newsFeedId", auth, limiter, newsFeedController.getNewsFeedById);
router.post("/shareNewsFeed/:newsFeedId", auth, limiter, newsFeedController.shareNewsFeed);
router.post("/likeNewsFeed/:newsFeedId", auth, limiter, newsFeedController.likePost);
router.post("/commentNewsFeed", auth, limiter, newsFeedController.commentNewsFeed);
router.put("/updateCommentNewsFeed", auth, limiter, newsFeedController.updateCommentNewsFeed);
router.delete("/deleteCommentNewsFeed", auth, limiter, newsFeedController.deleteCommentNewsFeed);
router.get("/newsFeedComment/:newsFeedId", auth, limiter, newsFeedController.getCommentsOfFeed);
router.post("/ratingnewsFeed/:newsFeedId", auth, limiter, newsFeedController.ratingPost);
router.get("/getAverageRating", auth, limiter, newsFeedController.getRatingAverage);


module.exports = router;
