const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
  },
  userFirstName: {
    type: String,
    default: "",
  },
  userLastName: {
    type: String,
    default: "",
  },
  userPassword: {
    type: String,
    require: true,
    // select: false
  },
  userEmail: {
    type: String,
    require: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  userCity: {
    type: String,
    default: "",
  },
  userAddress: {
    type: String,
    default: "",
  },
  userCountry: {
    type: String,
    default: "",
  },
  userNumber: {
    type: String,
    default: "",
  },
  userImage: {
    type: String,
    default: "",
  },
  userCover: {
    type: String,
    default: "",
  },
  userSchool: {
    type: String,
    default: "",
  },
  userTeam: {
    type: String,
    default: "",
  },
  userCoaches: {
    type: String,
    default: "",
  },
  userBio: {
    type: String,
    default: "",
  },
  userBio: {
    type: String,
    default: "",
  },
  userSpeed: {
    type: String,
    default: "",
  },
  userHeight: {
    type: String,
    default: "",
  },
  userWeight: {
    type: String,
    default: "",
  },
  userGpa: {
    type: String,
    default: "",
  },
  userSports: {
    type: [String],
    default: [],
  },
  userFollowers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  userFollowing: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  // userVerified: {
  //     type: Boolean,
  //     default: false
  // },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  // channel:{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "channels",
  // }

  // nameOfBusiness:{
  //     type: String,
  //     default: ""
  // },
  dateOFBirth: {
    type: Date,
    default: "",
  },
  userState: {
    type: String,
    default: "",
  },
  deviceType: {
    type: String,
    enum: ["android", "ios"],
  },
  deviceToken: {
    type: String,
  },
  otpNumber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "otps",
  },
});
userschema.virtual("userID").get(function () {
  return this._id.toHexString();
});

userschema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id;
  },
});

const userModel = mongoose.model("users", userschema);

module.exports = userModel;
