const mongoose = require("mongoose");

const privacySchema = new mongoose.Schema({

    privacyPolicy:{
        type:String,
        required:true
       },
       
       createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
       },

});


const privacyModel = mongoose.model("privacypolicy", privacySchema);

module.exports = privacyModel;