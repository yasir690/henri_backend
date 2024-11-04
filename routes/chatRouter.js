const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ChatRoomController = require("../controllers/chatController");
const limiter = require("../middleware/throttleservice");

router.post("/createChatRoom",limiter, auth, ChatRoomController.createChatRoom);
router.get("/getChatRooms",limiter, auth, ChatRoomController.getChatRooms);

module.exports = router;
