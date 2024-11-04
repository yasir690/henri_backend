const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    adminName: {
        type: String,
        required: false,
    },
    
    adminPassword: {
        type: String,
        required: true
    },

    adminEmail: {
        type: String,
        required: true,
        match:
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    
    adminImage: {
        type: String,
        default: "",
    },

    isLogOut:{
        type:Boolean,
        default:false 
    }

});


const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;