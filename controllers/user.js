var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
// const  Users  = require("../model/user");

const userModel = require("../model/user");
const multer = require("multer");
const { uploadFileWithFolder } = require("../utils/awsFileUploads");
const { loggerInfo, loggerError } = require("../utils/log");
require("dotenv").config();
// import { randomInt } from "crypto";
const crypto = require("crypto");

const channelModel = require("../model/channelModel");
// var loggerError=require("../utils/log");
const sendEmails = require("../utils/sendEmail.js");
const otpModel = require("../model/otpModel.js");
const send_message = require("../utils/sendSms.js");

const uploadOptions = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const verifyOtp = async (req, res) => {
  console.log("hh");
  try {
    const { userNumber, otp } = req.body;

    if (!userNumber) {
      return res.status(400).json({
        success: false,
        message: "number not provide",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "otp not provide",
      });
    }

    const user = await userModel
      .findOne({ userNumber: userNumber })
      .populate("otpNumber");
    console.log(user, "user");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const OTP = user.otpNumber;

    console.log(OTP, "OTP");

    if (!OTP) {
      // loggerError.error("otp not found");
      return res.status(400).json({
        success: false,
        message: "Otp Not Found",
      });
    } else if (OTP.otpUsed) {
      // loggerError.error("otp already used");
      return res.status(400).json({
        success: false,
        message: "Otp Already Used",
      });
    }

    if (OTP.otpKey !== otp) {
      // loggerError.error("Invalid OTP");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //otp expire after 1h
    const currentTime = new Date();
    const OTPTime = OTP.createdAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return res.status(400).json({
        success: false,
        message: "OTP expire",
      });
    }

    //generate token

    const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
      expiresIn: "1d",
    });

    //token save

    user.userToken = token;
    await user.save();

    OTP.otpUsed = true;
    await OTP.save();

    user.otpVerified = true;
    user.otpNumber = null;
    await user.save();

    const profile = { ...user._doc, userToken: token };

    return res.status(200).json({
      success: true,
      message: "otp verified successfully",
      data: profile,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { userNumber } = req.body;

    if (!userNumber) {
      return res.status(400).json({
        success: false,
        message: "user number not provide",
      });
    }

    const user = await userModel.findOne({ userNumber: userNumber });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    // const OTP = Math.floor(10000 + Math.random() * 900000);
    const OTP = Math.floor(100000 + Math.random() * 900000);

    // const otpDB = await otpModel.findOneAndUpdate(
    //   {
    //     users: user._id,
    //   },
    //   {
    //     $setOnInsert: {
    //       users: user._id,
    //     },
    //     $set: {
    //       otpKey: OTP,
    //       expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    //       otpUsed: false,
    //     },
    //   },
    //   {
    //     upsert: true,
    //     new: true,
    //   }
    // );
    // const updateOtp = await userModel.findByIdAndUpdate(user._id, {
    //   otpNumber: otpDB._id,
    // });

    const otpDB = await otpModel.findOneAndUpdate(
      {
        users: user._id,
      },
      {
        $setOnInsert: {
          users: user._id,
        },
        $set: {
          otpKey: OTP,
          expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
          otpUsed: false,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    const updateOtp = await userModel.findByIdAndUpdate(user._id, {
      otpNumber: otpDB._id,
    });

    await updateOtp.save();

    // sendEmails.sendEmails(
    //   user.userEmail,
    //   "Otp Resend Successfully",
    //   `<h5>Your Otp is ${OTP}</h5>`
    // );

    await send_message({ recipient: userNumber, otp: OTP });

    return res.status(200).json({
      success: true,
      message: "opt resend successfully",
      data: OTP,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const registerUser = async (req, res) => {
  console.log("hit");
  const { userNumber } = req.body;

  const usercheck = await userModel.findOne({
    // userEmail: req.body.userEmail,
    // userName:req.body.userName
    $or: [{ userEmail: req.body.userEmail }, { userName: req.body.userName }],
  });
  if (usercheck) {
    return res
      .status(200)
      .json({ message: "user name or email already exist", success: false });
  }
  // Const Match Regex for password
  // const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  if (!req.body.isSocial) {
    // if (!passwordRegex.test(req.body.userPassword)) {
    //     return res.status(200).json({
    //         success: false,
    //         message: "Password must be 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    //     });
    // }
  }
  const user = new userModel({
    userEmail: req.body.userEmail,
    userName: req.body.userName,
    userPassword: req.body.isSocial
      ? ""
      : bcrypt.hashSync(req.body.userPassword, 8),
    dateOFBirth: req.body.dateOFBirth,
    userCity: req.body.userCity,
    userState: req.body.userState,
    userCountry: req.body.userCountry,
    userNumber: userNumber,
    deviceType: req.body.deviceType,
  });

  if (!user) {
    loggerError.error("User register failed", { userName: req.body.userName });
  }
  const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
    expiresIn: "7d",
  });
  // save user token
  user.userToken = token;
  try {
    const usersave = await user.save();
    loggerInfo.info("User register successfully", {
      userName: req.body.userName,
    });

    console.log("hit2");

    // const apiLink = `https://triplepsports.mobi/verifyUser/${usersave.id}`;
    // // http://3.17.57.230:4000/api/v1/
    // sendEmails.sendEmails(
    //   usersave.userEmail,
    //   "Link Sent Successfully",
    //   `<h5>Your link is <a href="${apiLink}">${apiLink}</a></h5>`
    // );
    // const OTP=Math.random(100000,999999);
    // const OTP = Math.floor(10000 + Math.random() * 900000);
    // const OTP=Math.random(100000,999999);
    const OTP = Math.floor(100000 + Math.random() * 900000);

    // console.log(OTP,'OTP');
    //create otp document

    // const createOtp = new otpModel({
    //   users: user._id,
    //   otpKey: OTP,
    //   // otpUsed:false,
    //   // otpType:"Email",
    // });

    // const saveOtp = await createOtp.save();

    // console.log(OTP,'OTP');
    //create otp document

    const createOtp = new otpModel({
      users: user._id,
      otpKey: OTP,
      // otpUsed:false,
      // otpType:"Email",
    });

    const saveOtp = await createOtp.save();

    const updateOtp = await userModel.findByIdAndUpdate(user._id, {
      otpNumber: saveOtp._id,
    });

    await updateOtp.save();

    await send_message({ recipient: userNumber, otp: OTP });

    res.status(200).json({
      success: true,
      data: { usersave, otp: OTP },
      message: "User saved successfully",
    });
  } catch (err) {
    console.log(err);
    loggerError.error("An error occurred", { error: err });

    if (err.name === "ValidationError") {
      console.error(Object.values(err.errors).map((val) => val.message));
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map((val) => val.message)[0],
      });
    }
    return res.status(400).json({ success: false, message: err });
  }
};

const loginUser = async (req, res) => {
  // loggerError.error('Testing error log');
  try {
    let user = null;
    if (req.body.userName) {
      user = await userModel.findOne({ userName: req.body.userName }).lean();
    } else {
      user = await userModel
        .findOne({ userNumber: req.body.userNumber })
        .lean();
    }
    if (!user) {
      return res
        .status(200)
        .json({ message: "user not found", success: false });
    }
    if (!user.otpVerified) {
      return res.status(200).json({
        message: "User needs to verified please verify first then login...",
        success: false,
      });
    }
    if (user.userSocialToken) {
      const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
        expiresIn: "7d",
      });
      user.userToken = token;

      console.log(token, "token");

      return res
        .status(200)
        .json({ message: "user logged in as social", success: false });
    }
    if (user && bcrypt.compareSync(req.body.userPassword, user.userPassword)) {
      const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
        expiresIn: "7d",
      });
      user.userToken = token;
      loggerInfo.info("User authenticated successfully", {
        userName: req.body.userName,
      });

      return res
        .status(200)
        .json({ message: "login successfully", data: user, success: true });
    }

    return res.status(200).json({ message: "login failed", success: false });
  } catch (err) {
    loggerError.error("An error occurred", { error: err });

    console.log(err);
    if (err.name === "ValidationError") {
      console.error(Object.values(err.errors).map((val) => val.message));

      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map((val) => val.message)[0],
      });
    }

    return res.status(400).json({ success: false, message: err });
  }
};

const updateUser = async (req, res) => {
  console.log("hit");
  if (req.body.userName) {
    const usercheck = await userModel.find({ userName: req.body.userName });
    if (usercheck.length !== 0) {
      return res
        .status(400)
        .json({ message: "User name already exists", success: false });
    }
  }

  try {
    const { files } = req;
    let imageLocation = "";
    let coverImageLocation = "";

    if (files.image) {
      const file = files.image[0];
      const fileName = file.originalname;
      const fileContent = file.buffer;
      imageLocation = await uploadFileWithFolder(
        fileName,
        "newsFeed",
        fileContent
      );
    }

    if (files.coverimage) {
      const file = files.coverimage[0];
      const fileName = file.originalname;
      const fileContent = file.buffer;
      coverImageLocation = await uploadFileWithFolder(
        fileName,
        "newsFeed",
        fileContent
      );
    }

    const updateUser = await userModel.findByIdAndUpdate(
      req.user.user_id,
      {
        userEmail: req.body.userEmail,
        userName: req.body.userName,
        userCity: req.body.userCity,
        userAddress: req.body.userAddress,
        userCountry: req.body.userCountry,
        userNumber: req.body.userNumber,
        userSchool: req.body.userSchool,
        userTeam: req.body.userTeam,
        userCoaches: req.body.userCoaches,
        userBio: req.body.userBio,
        userSports: req.body.userSports,
        userSpeed: req.body.userSpeed,
        userHeight: req.body.userHeight,
        userWeight: req.body.userWeight,
        userGpa: req.body.userGpa,
        userImage: imageLocation,
        userCover: coverImageLocation,
      },
      {
        new: true,
      }
    );

    if (!updateUser) {
      loggerError.error("User not updated", { userName: req.body.userName });
      return res.status(404).json({
        success: false,
        message: "User not found or not updated",
      });
    }

    loggerInfo.info("User updated successfully", {
      userName: req.body.userName,
    });

    return res.status(200).json({
      success: true,
      data: updateUser,
      message: "User saved successfully",
    });
  } catch (err) {
    loggerError.error("An error occurred", { error: err });

    console.log(err);
    if (err.name === "ValidationError") {
      console.error(Object.values(err.errors).map((val) => val.message));
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map((val) => val.message)[0],
      });
    }
    return res.status(500).json({ success: false, message: err });
  }
};

const updateUserProfile = async (req, res) => {
  console.log("hit");
  if (req.body.userName) {
    const usercheck = await userModel.find({ userName: req.body.userName });
    if (usercheck.length !== 0) {
      return res
        .status(400)
        .json({ message: "User name already exists", success: false });
    }
  }

  try {
    const updateUser = await userModel.findByIdAndUpdate(
      req.user.user_id,
      {
        userEmail: req.body.userEmail,
        userName: req.body.userName,
        userCity: req.body.userCity,
        userAddress: req.body.userAddress,
        userCountry: req.body.userCountry,
        userNumber: req.body.userNumber,
        userSchool: req.body.userSchool,
        userTeam: req.body.userTeam,
        userCoaches: req.body.userCoaches,
        userBio: req.body.userBio,
        userSports: req.body.userSports,
        userSpeed: req.body.userSpeed,
        userHeight: req.body.userHeight,
        userWeight: req.body.userWeight,
        userGpa: req.body.userGpa,
      },
      {
        new: true,
      }
    );

    if (!updateUser) {
      loggerError.error("User not updated", { userName: req.body.userName });
      return res.status(404).json({
        success: false,
        message: "User not found or not updated",
      });
    }

    loggerInfo.info("User updated successfully", {
      userName: req.body.userName,
    });

    return res.status(200).json({
      success: true,
      data: updateUser,
      message: "User saved successfully",
    });
  } catch (err) {
    loggerError.error("An error occurred", { error: err });

    console.log(err);
    if (err.name === "ValidationError") {
      console.error(Object.values(err.errors).map((val) => val.message));
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map((val) => val.message)[0],
      });
    }
    return res.status(500).json({ success: false, message: err });
  }
};

const getUserByUserID = async (req, res) => {
  const user = await userModel.findById(req.params.id);

  // .select({

  //     "userPassword":0,
  //     "userCity":0,
  //     "userTeam":0 ,
  //     "userCoaches":0 ,
  //     "userBio":0 ,
  //     "userSchool":0,
  //     "userSports":0
  // });
  if (!user) {
    loggerError.error("User not found", { userName: req.body.userName });

    return res.status(200).json({ message: "user not found", success: false });
  }

  loggerInfo.info("User found successfully", { userName: req.body.userName });

  return res
    .status(200)
    .json({ message: "success", success: true, data: user });
};

const followOrUnfollow = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { follow_id } = req.body;
    if (follow_id == null || follow_id == undefined || follow_id == "") {
      return res
        .status(200)
        .json({ message: "FollowerId Required", success: false });
    }
    if (follow_id == user_id) {
      return res
        .status(200)
        .json({ message: "You can't follow yourself", success: false });
    }
    const user = await userModel.findOne({ _id: user_id }).lean();
    const follower = await userModel.findOne({ _id: follow_id }).lean();
    // if (!user) {
    //   return res
    //     .status(200)
    //     .json({ message: "user not found", success: false });
    // }
    // // check Follower
    // const checkFollower = await Users.findOne({ _id: follow_id }).lean();
    // if (!checkFollower) {
    //   return res
    //     .status(200)
    //     .json({ message: "user not found", success: false });
    // }
    // Check already follow or not
    const checkFollow = await userModel
      .findOne({
        _id: user_id,
        userFollowing: { $in: [follow_id] },
      })
      .lean();
    if (checkFollow) {
      // Unfollow
      const unfollow = await userModel.findOneAndUpdate(
        { _id: user_id },
        {
          $pull: { userFollowing: follow_id },
        }
      );
      await userModel.findOneAndUpdate(
        { _id: follow_id },
        {
          $pull: { userFollowers: user_id },
        },
        { new: true }
      );

      if (!unfollow) {
        return res.status(200).json({
          message: "unfollow not done",
          success: false,
        });
      }
      return res.status(200).json({
        message: "unfollow done",
        success: true,
        follow: false,
      });
    } else {
      // Follow
      const follow = await userModel.findOneAndUpdate(
        { _id: user_id },
        {
          $push: { userFollowing: follow_id },
        }
      );
      await userModel.findOneAndUpdate(
        { _id: follow_id },
        {
          $push: { userFollowers: user_id },
        },
        { new: true }
      );
      // sendNotification(
      //   follower.userNotificationToken,
      //   "Follow",
      //   `${user.userName} follow you`
      // );
      // const notificationFollo = {
      //   userID: follower._id.toString(),
      //   title: "Follow",
      //   message: `${user.userName} follow you`,
      // };
      // await axios.post(
      //   `${process.env.mainserverurl}/notification/createUsersNotification`,
      //   notificationFollo
      // );
      // sendNotification(
      //   user.userNotificationToken,
      //   "Follow",
      //   `You follow ${follower.userName}`
      // );
      // const followNotification = {
      //   userID: user._id.toString(),
      //   title: "Follow",
      //   message: `You follow ${follower.userName}`,
      // };
      // await axios.post(
      //   `${process.env.mainserverurl}/notification/createUsersNotification`,
      //   followNotification
      // );

      if (!follow) {
        return res.status(200).json({
          message: "follow not done",
          success: false,
        });
      }
      loggerInfo.info("following", { userName: req.body.userName });

      return res.status(200).json({
        message: "follow done",
        success: true,
        follow: true,
      });
    }
  } catch (err) {
    loggerError.error("An error occurred", { error: err });

    return res.status(400).json({ success: false, message: err });
  }
};

const getUsersFans = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.user_id)
      .populate("userFollowers");

    if (!user) {
      loggerError.error("not found user fans", { userName: req.body.userName });

      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    loggerInfo.info("get user fans", { userName: req.body.userName });

    return res
      .status(200)
      .json({ message: "success", success: true, data: user.userFollowers });
  } catch (err) {
    loggerError.error("An error occurred", { error: err.message });

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getUserTeamMates = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.user_id)
      .populate(["userFollowers", "userFollowing"]);

    if (!user) {
      loggerError.error("not found user teammates", {
        userName: req.body.userName,
      });

      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const commonObjects = user.userFollowers.filter((obj1) =>
      user.userFollowing.some((obj2) => obj2.userName === obj1.userName)
    );
    loggerInfo.info("get user teammates", { userName: req.body.userName });

    return res.status(200).json({
      success: true,
      message: "success",
      data: commonObjects,
    });
  } catch (err) {
    loggerError.error("An error occurred", { error: err });

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await userModel.findById(user_id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const finduser = await userModel.findById(user._id);
    const OTP = Math.floor(100000 + Math.random() * 900000);

    console.log(OTP, "OTP");
    //create otp document

    if (!finduser) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const deleteuser = await userModel.findByIdAndDelete(finduser._id);

    if (!deleteuser) {
      return res.status(400).json({
        success: false,
        message: "user not delete",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { userNumber } = req.body;

    const user = await userModel.findOne({
      userNumber: userNumber,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "number not found",
      });
    }

    const OTP = Math.floor(10000 + Math.random() * 900000);

    console.log(OTP, "OTP");
    //create otp document

    const createOtp = new otpModel({
      users: user._id,
      otpKey: OTP,
    });

    const saveOtp = await createOtp.save();

    const updateOtp = await userModel.findByIdAndUpdate(user._id, {
      otpNumber: saveOtp._id,
    });

    await updateOtp.save();

    await send_message({ recipient: userNumber, otp: OTP });

    return res.status(200).json({
      success: true,
      message: "Otp Sent Successfully",
      data: OTP,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { user_id } = req.user;
    console.log(user_id);

    const { userPassword } = req.body;
    const user = await userModel.findById(user_id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    const updatePassword = await userModel.findByIdAndUpdate(
      user_id,
      {
        userPassword: bcrypt.hashSync(userPassword, 10),
      },
      { new: true }
    );

    if (!updatePassword) {
      return res.status(400).json({
        success: false,
        message: "Password Not Update",
      });
    }

    return res.status(200).json({
      success: true,
      message: "password update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserByUserID,
  followOrUnfollow,
  getUserTeamMates,
  getUsersFans,
  updateUserProfile,
  verifyOtp,
  resendOtp,
  updateUser: [
    uploadOptions.fields([
      {
        name: "image",
        maxCount: 1,
      },
      {
        name: "coverimage",
        maxCount: 1,
      },
    ]),
    updateUser,
  ],
  deleteUser,
  forgetPassword,
  resetPassword,
};
