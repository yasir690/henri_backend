require("dotenv/config");
const ChatRoomsModel = require("../model//chatroomModel");
const ChatRoomMessagesModel = require("../model/chatroommessageModel");

// const { uploadFileWithFolder } = require("../utils/awsFileUploads");

const getChatRoomData = async (io, data) => {
    try {
        const { chatroom, user } = data;
        const ChatRoom = await ChatRoomsModel.findOne({
            _id: chatroom,
            users: { $in: [user] },
        })
            .populate("messages")
            .lean();
        if (!ChatRoom) {
            return io.to(user).emit("getRoom", {
                status: "error",
                message: "Chat room not found",
            });
        }
        // const users = ChatRoom.users;
        // const UsersData = await GetAlluserData(users);
        // const newUsersData = UsersData.map((user) => {
        //   return user;
        // });
        // // Add the user to the Message object
        // const newMessages = ChatRoom.messages.map((message) => {
        //   const user = UsersData.find((user) => user._id == message.user);
        //   return {
        //     ...message._doc,
        //     user: user,
        //   };
        // });
        // const newChatRoomData = {
        //   _id: ChatRoom._id,
        //   users: ChatRoom.users,
        //   messages: ChatRoom.messages,
        // };
        io.to(user).emit("getRoom", {
            status: "success",
            data: ChatRoom,
            message: "Chat room data fetched successfully",
        });
    } catch (error) {
        console.error(error);
    }
};

const sendMessages = async (io, data) => {
    try {
        // // Join User to Chatroom
        // io.to(data.user).join(data.chatroom);
        const { chatroom, user, message, messageType } = data;
        const ChatRoomData = await ChatRoomsModel.findById(chatroom);
        if (!ChatRoomData) {
            return io.to(user).emit("message", {
                status: "error",
                message: "Chat room not found",
            });
        }

        console.log(ChatRoomData,'chatroomdata');
        
        // const users = ChatRoomData.users;
        // // const UsersData = await GetAlluserData(users);
        // const newUsersData = await GetAlluserData(users);
        // // Filter out the user who sent the message
        // const newUsersDataFilter = newUsersData.filter(
        //   (user) => user._id.toString() === data.user
        // );


          // Check if user is part of the chatroom
    if (!ChatRoomData.users.includes(user)) {
        return io.to(user).emit("message", {
          status: "error",
          message: "User is not part of this chat room",
        });
      }

        const newMessage = await ChatRoomMessagesModel.create({
            chatroom: chatroom._id,
            user: user,
            message: message,
            messageType: messageType.toUpperCase(),
        });
        await ChatRoomsModel.findByIdAndUpdate(
            chatroom,
            {
                $push: { messages: newMessage._id },
            },
            { new: true }
        ).populate("messages");
        // const messageData = {
        //   chatroom: newMessage.chatroom,
        //   user: newUsersDataFilter,
        //   message: newMessage.message,
        //   messageType: messageType.toUpperCase(),
        // };

        // const newUsers = newUsersData.map((user) => user._id.toString());
        ChatRoomData.users.forEach((user) => {
            io.to(user.toString()).emit("message", {
                status: "success",
                data: newMessage,
                message: "Message sent successfully",
            });
        });
        // // Send Notification
        // newUsersDataFilter.filter((user) => {
        //   if (user._id.toString() !== data.user) {
        //     sendNotification(
        //       user.userNotificationToken,
        //       "New Message",
        //       "You have a new message"
        //     );
        //   }
        // });
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    sendMessages,
    getChatRoomData,
};