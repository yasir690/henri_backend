const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelControler");

const auth = require("../middleware/auth");

router.get("/generate-token", auth, channelController.agoraTokenGenerate);
// router.post("/createchannelroom",auth,channelController.createChannelRoom);
router.get("/getchannelroom", auth, channelController.getChannelRoom);
router.delete("/deletechannelroom/:channelId", auth, channelController.deleteChannelRoom);
module.exports = router;
