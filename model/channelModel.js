const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channelName: {
    type: String,
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  // role: {
  //   type: String,
  //   enum: ['publisher', 'subscriber'],
  //   default: 'publisher',
  // },
  token: {
    type: String
  },
  // channelRoom:{
  //   type:mongoose.Schema.Types.ObjectId,
  //   ref:"channelrooms"
  // }
});


const channelModel = mongoose.model('channels', channelSchema);


const channelRoomSchema = new mongoose.Schema({
  channelRoomName: {
    type: String,
    // required: true
  },
  token: {
    type: String,
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'channels',
    // required: true
  }
});

const channelRoomModel = mongoose.model('channelrooms', channelRoomSchema);

// module.exports=channelModel;
// module.exports=channelRoomModel;

module.exports = {
  channelModel,
  channelRoomModel
}