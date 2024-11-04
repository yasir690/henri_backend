const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");


const limiter = require("../middleware/throttleservice");
const auth = require("../middleware/auth");


router.post("/adminRegister", limiter, adminController.adminRegister);

router.post("/adminLogin", limiter, adminController.adminLogin);

router.get("/countUser", limiter,auth, adminController.countUser);

router.get("/getAllUser", limiter,auth, adminController.getAllUser);

router.get("/getAndroidAndIosUser", limiter,auth, adminController.getAndroidAndIosUser);

router.get("/getAllUserPosts/:userId", limiter,auth, adminController.getAllUserPosts);

router.post("/createUserTermsAndCondition", limiter,auth, adminController.createUserTermsAndCondition);

router.get("/getUsersTermsAndCondition", limiter,auth, adminController.getUsersTermsAndCondition);

router.put("/updateUserTermsAndCondition/:id", limiter,auth, adminController.updateUserTermsAndCondition);

router.post("/createUserPrivacyPolicy", limiter,auth, adminController.createUserPrivacyPolicy);

router.get("/getUsersPrivacyPolicy", limiter,auth, adminController.getUsersPrivacyPolicy);

router.put("/updateUserPrivacyPolicy/:id", limiter,auth, adminController.updateUserPrivacyPolicy);

router.get("/adminLogOut", limiter,auth, adminController.adminLogOut);

router.put("/changePassword", limiter,auth, adminController.changePassword);




module.exports=router;