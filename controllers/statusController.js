
const { Status } = require("../model/status");
const {Highlights} =require("../model/highlights");
// const {ratingNewsFeedModel}=require("../model/ratingnewsfeedModel");
const multer = require("multer");
const { uploadFileWithFolder } = require("../utils/awsFileUploads");
const { Users } = require("../model/user");
const moment = require('moment');
const newsFeedModel = require("../model/newsFeedModel");
const {loggerInfo,loggerError}  = require('../utils/log');


const uploadOptions = multer({
    storage: multer.memoryStorage(),
    // limits: {
    //     fileSize: 3145728,
    // },
});



const createStatus = async (req, res) => {
    try {
      const { text } = req.body;
      const { files } = req;
      const { user_id } = req.user;
      const images = [];
  
      let imageLocation = "";
      let videoLocation = "";
  
      if (files.image) {
        const file = files.image[0];
        const fileName = file.originalname;
        const fileContent = file.buffer;
        imageLocation = await uploadFileWithFolder(fileName, "newsFeed", fileContent);
      }
  
      if (files.video) {
        const file = files.video[0];
        const fileName = file.originalname;
        const fileContent = file.buffer;
        videoLocation = await uploadFileWithFolder(fileName, "newsFeed", fileContent);
      }
  
      // Status create
      const status = await Status.create({
        statusText: text,
        statusImage: imageLocation,
        statusVideo: videoLocation,
        createdBy: user_id,
      });
    //   console.log(status);
  
    if(!status){
      loggerError.error('status not created', { userName: req.body.userName });

      return res.status(400).json({
        success:false,
        message:"status not create"
      })
    }
      // Highlight create
      const highlight = await Highlights.create({
        highlightText: text,
        highlightImage: imageLocation,
        highlightVideo: videoLocation,
        createdBy: user_id,
      });
 
    setTimeout(async () => {
        try {
          const deletedStatus = await Status.findByIdAndDelete({_id:status._id});
          console.log(deletedStatus);
          console.log(`Deleted status with ID: ${deletedStatus._id}`);
        } catch (error) {
          console.log('An error occurred while deleting the status:', error);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      loggerInfo.info('status created succesfully', { userName: req.body.userName });

      res.status(200).json({
        success: true,
        message: "Status Added Successfully",
        data: status,
      });

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
  


const getStatus = async (req, res) => {
    try {

        const userStatus = await Status.find().populate('createdBy');
       
        if(!userStatus){
          loggerError.error("status not found")
            return res.status(400).json({
                success:false,
                message:"status not found"
            })
        }

        
        loggerInfo.info("status found")

        return res.status(200).json({
            success:true,
            message:"status found successfully",
            data:userStatus
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
          createStatus: [uploadOptions.fields([{
        name: 'image', maxCount: 1
    }, {
        name: 'video', maxCount: 1 
    }]), createStatus],
    getStatus,

};
