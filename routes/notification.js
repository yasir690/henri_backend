const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notification");
const limiter = require("../middleware/throttleservice");


router.get("/getNotification", auth, limiter, notificationController.getNotification);



module.exports = router;
