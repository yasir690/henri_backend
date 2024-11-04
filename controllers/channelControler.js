const { channelModel } = require('../model/channelModel');
const generateAgoraToken = require('../utils/agoraTokenGenerate');
const userModel = require('../model/user');
const { channelRoomModel } = require('../model/channelModel');

//agora token generate by user id
const agoraTokenGenerate = async (req, res) => {
  try {
    const { user_id } = req.user;
    console.log(user_id);
    const appId = process.env.APP_ID;
    const appCertificate = process.env.APP_CERTIFICATE;
    const channelName = req.query.channelName;

    // Validate user ID
    if (!user_id) {
      return res.status(400).json({ error: "User ID is not valid" });
    }

    const uid = user_id;
    const role = req.query.role || "publisher";

    if (!appId || !appCertificate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Additional validation for channel name and role
    if (!channelName || typeof channelName !== "string") {
      return res.status(400).json({ error: "Required channel name" });
    }

    if (role !== "publisher" && role !== "subscriber") {
      return res.status(400).json({ error: "Invalid role" });
    }

    const agoraToken = generateAgoraToken(appId, appCertificate, channelName, uid.toString(), role);


    // Save user info, channel name, and ID to MongoDB
    const user = await channelModel.findById(user_id);
    if (!user) {
      // User not found, create a new one
      const newUser = new channelModel({
        channelName: channelName,
        uid: uid.toString(),
        token: agoraToken // Save the token field in the model
      });
      await newUser.save();
    } else {
      // Update existing user
      user.channelName = channelName;
      user.uid = uid.toString();
      user.token = agoraToken; // Update the token field in the model
      await user.save();
    }

    res.json({
      token: agoraToken, channelName: channelName,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};





//create chat room

// const createChannelRoom = async (req, res) => {
//   try {
//     const { user_id } = req.user;
//     const uid = user_id;
//     const { channelName, role, createdBy, date, channelRoomName } = req.body;
//     const appId = process.env.APP_ID;
//     const appCertificate = process.env.APP_CERTIFICATE;
//     const user = await userModel.findById(user_id);

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Generate Agora token
//     const token = generateAgoraToken(appId, appCertificate, channelName, uid.toString(), role);

//     // Create channel room
//     const channelRoom = new channelRoomModel({
//       token,
//       channelName,
//       createdBy,
//       date,
//       channelRoomName
//     });

//     const savedChannelRoom = await channelRoom.save();

//     // Create a new channel and assign it to channel room
//     const channel = new channelModel({
//       channelName,
//       uid: user_id,
//       role,
//       channelRoom: savedChannelRoom._id
//     });

//     const savedChannel = await channel.save();

//     // Update the channelRoom with the associated channel
//     savedChannelRoom.channel = savedChannel._id;
//     await savedChannelRoom.save();

//     return res.status(201).json(savedChannelRoom);
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };


const getChannelRoom = async (req, res) => {
  try {
    const { user_id } = req.user;

    const user = await channelModel.find().populate({
      'path': 'uid',
      select: { 'userName': 1, 'userEmail': 1, 'userImage': 1, 'userID': 1 }

    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found"
      })
    }

    //find channel room
    // const findRoom = await channelRoomModel.find().populate(['createdBy', 'channel']);
    // if (!findRoom) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "channel room not found"
    //   })
    // }

    return res.status(200).json({
      success: true,
      message: "channel room found successfully",
      data: user
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

const deleteChannelRoom = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { channelId } = req.params;
    const userfind = await userModel.findById(user_id);

    if (!userfind) {
      return res.status(400).json({
        success: false,
        message: "user not found"
      })
    }

    // const channel=await channelId.fin
    //delete channel room

    const deletechannelroom = await channelRoomModel.findByIdAndDelete(channelId);

    if (!deletechannelroom) {
      return res.status(400).json({
        success: false,
        message: "channel room id not found"
      })
    }


    //delete channel room id in channel model

    await channelModel.deleteMany({ _id: { $in: deletechannelroom.channel } });
    return res.status(200).json({
      success: true,
      message: "channel room delete successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}


module.exports = { agoraTokenGenerate, getChannelRoom, deleteChannelRoom }