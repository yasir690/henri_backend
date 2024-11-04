const mongoose = require("mongoose");

const termsconditionSchema = new mongoose.Schema({

    termsCondition:{
        type:String,
        required:true
       },
       
       createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
       },
});


const termsConditionModel = mongoose.model("termscondition", termsconditionSchema);

module.exports = termsConditionModel;