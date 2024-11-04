const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const statusController = require("../controllers/statusController");
const limiter = require("../middleware/throttleservice");


router.post("/createStatus",limiter, auth, statusController.createStatus);
router.get("/getStatus", limiter,auth, statusController.getStatus);

module.exports = router;
