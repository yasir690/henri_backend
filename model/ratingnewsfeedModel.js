const mongoose = require('mongoose');

const ratingNewsFeedSchema = new mongoose.Schema(
    {
        newsFeedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "newsFeed",
        },
        ratingBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        rating: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

const ratingNewsFeedModel = mongoose.model("ratingNewsFeed", ratingNewsFeedSchema);

module.exports = ratingNewsFeedModel;