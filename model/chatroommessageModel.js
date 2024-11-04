const mongoose = require("mongoose");

const ChatRoomMessagesSchema = new mongoose.Schema(
    {
        chatroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "chatrooms",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        message: {
            type: String,
            required: true,
        },
        messageType: {
            type: String,
            required: true,
            enum: ["TEXT", "IMAGE", "VIDEO", "AUDIO"],
        },
    },
    { timestamps: true }
);

const ChatRoomMessagesModel = mongoose.model(
    "messages",
    ChatRoomMessagesSchema
);

module.exports = ChatRoomMessagesModel;
