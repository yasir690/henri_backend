const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    showto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    notificationType: {
        type: String,
        enum: ["POST", "RANDOM"],
        default: "RANDOM",
    },

    postid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "newsFeed",
    },
    notificationTitle: {
        type: String,
    },
    notificationSubtitle: {
        type: String,
    },
    showto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
});

const NotificationModel = mongoose.model("notification", NotificationSchema);

module.exports = NotificationModel;
