// require('dotenv').config();

// const Client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const SendSMS = async (to, smsBody, next) => {
//     try {
//         console.log(smsBody,'smsBody');
//         console.log(to,'to');
//       await Client.messages
//         .create({
//           body: smsBody,
//           from:'+18446550180',
//           to: to,
//         })
//         .then((message) => {
//           console.log(message);
//           next;
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   };

// module.exports=SendSMS;

const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const send_message = async ({ otp, recipient }) => {
  try {
    const message = await client.messages.create({
      body: `Your account verification OTP is: ${otp}`,
      from: process.env.number,
      to: recipient,
    });
    console.log("sent message: " + message.body);
  } catch (error) {
    console.log(error);
  }
};
module.exports = send_message;