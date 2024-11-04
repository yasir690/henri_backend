const mongoose = require("mongoose");

const ChatRoomsSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    ],
    type: {
        type: String,
        enum: ["PRIVATE", "GROUP"],
        default: "PRIVATE",
    },
    matchid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages",
        },
    ],
});

const ChatRoomsModel = mongoose.model("chatrooms", ChatRoomsSchema);

module.exports = ChatRoomsModel;
