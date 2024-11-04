
const { Status } = require("../model/status");
const { Highlights } = require("../model/highlights");
// const {ratingNewsFeedModel}=require("../model/ratingnewsfeedModel");
const multer = require("multer");
const { uploadFileWithFolder } = require("../utils/awsFileUploads");
const { Users } = require("../model/user");
const moment = require('moment');
const newsFeedModel = require("../model/newsFeedModel");
const { loggerInfo, loggerError } = require('../utils/log');
const notificationModel = require("../model/notification");



const getNotification = async (req, res) => {
    try {
        const { user_id } = req.user;

        const usernotifications = await notificationModel.find();

        return res.status(200).json({
            success: true,
            message: "notification found successfully",
            data: usernotifications
        })
    } catch (error) {
        loggerError.error('An error occurred', { error: error });

        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};



module.exports = {

    getNotification,

};
