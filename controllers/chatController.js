const multer = require("multer");
const ChatRoomsModel = require("../model/chatroomModel");
require("dotenv/config");

const uploadOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

const createChatRoom = async (req, res) => {
    try {
        const { users, matchid } = req.body;
        const { user_id } = req.user;
        const chatType = users.length > 1 ? "GROUP" : "PRIVATE";
        // If ChatType is Group Add matchid
        var Query;
        var chatRoomData;
        if (chatType === "GROUP") {
            Query = {
                users: { $all: [...users, user_id] },
                type: chatType,
                matchid: matchid,
            };
        } else {
            Query = {
                users: { $all: [...users, user_id] },
                type: chatType,
            };
        }
        // Check if chat room already exists
        const chatRoomExists = await ChatRoomsModel.findOne(Query);
        if (chatRoomExists) {
            return res.status(200).json({
                success: true,
                data: chatRoomExists,
                message: "Chat room already exists",
            });
        }
        // Create Chat Room
        if (chatType === "GROUP") {
            chatRoomData = {
                users: [...users, user_id],
                type: chatType,
                matchid: matchid,
            };
        } else {
            chatRoomData = {
                users: [...users, user_id],
                type: chatType,
            };
        }
        const chatRoom = await ChatRoomsModel.create(
            chatRoomData
        );

        res.status(200).json({
            success: true,
            data: chatRoom,
            message: "Chat room created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getChatRooms = async (req, res) => {
    try {
        const { user_id } = req.user;
        // Populate Latest Message
        const chatRooms = await ChatRoomsModel.find({
            users: { $in: [user_id] },
            type: "PRIVATE",
        }).populate({
            path: "users",
        });
        // Remove Item if no messages
        const chatRoomsWithMessages = chatRooms.filter(
            (chatRoom) => chatRoom.messages.length > 0
        );
        for (let i = chatRoomsWithMessages.length - 1; i >= 0; i--) {
            chatRoomsWithMessages[i].users = chatRoomsWithMessages[i].users.filter(item => item._id.toString() !== user_id);
        }
        // const token =
        //   req.body.token || req.query.token || req.headers["x-access-token"];
        // const config = {
        //   headers: {
        //     "Content-Type": "application/json",
        //     "x-access-token": token,
        //   },
        // };
        // const chatRoomsWithUsers = await Promise.all(
        //   chatRoomsWithMessages.map(async (chatRoom) => {
        //     const users = await Promise.all(
        //       chatRoom.users.map(async (user) => {
        //         const { data } = await axios.get(
        //           `${process.env.mainserverurl
        //           }/auth/getUserByUserID/${user.toString()}`,
        //           config
        //         );
        //         return data.data;
        //       })
        //     );
        //     return {
        //       ...chatRoom._doc,
        //       users,
        //     };
        //   })
        // );

        res.status(200).json({
            success: true,
            data: chatRoomsWithMessages,
            message: "Chat rooms fetched successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createChatRoom,
    getChatRooms,
};
