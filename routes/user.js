const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

const limiter = require("../middleware/throttleservice");
const auth = require("../middleware/auth");

router.post("/register", limiter, userController.registerUser);
router.post("/login", limiter, userController.loginUser);
// router.put("/updateUser",auth,limiter, userController.updateUser);
router.post("/updateUser", auth, limiter, userController.updateUser);
router.post("/updateUserProfile", auth, limiter, userController.updateUserProfile);



router.get("/getUserByUserID/:id", userController.getUserByUserID);
// router.post("/updateUser", limiter, auth, userController.updateUser);

router.post("/followOrUnfollow", limiter, auth, userController.followOrUnfollow);
router.get("/getUsersFans", auth, userController.getUsersFans);
router.get("/getUserTeamMates", auth, userController.getUserTeamMates);
router.post("/verifyOtp", limiter, userController.verifyOtp);
router.post("/resendOtp", limiter, userController.resendOtp);

router.delete("/deleteUser", limiter,auth, userController.deleteUser);
router.post("/forgetpassword", limiter, userController.forgetPassword);
router.post("/resetpassword", limiter,auth, userController.resetPassword);





module.exports = router;
