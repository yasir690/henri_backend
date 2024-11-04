const mongoose = require("mongoose");

const highlightschema = new mongoose.Schema({
    highlightText: {
        type: String,
        default: "",
    },
    highlightImage: {
        type: String,
        default: "",
    },
    highlightVideo: {
        type: String,
        default: "",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

});



highlightschema.virtual("highlightID").get(function () {
    return this._id.toHexString();
});

highlightschema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret.id;
    },
});

exports.Highlights = mongoose.model("highlights", highlightschema);

exports.highlightschema = highlightschema;
