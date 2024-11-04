const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();
const { emailConfig } = require('../config/emailconfig');
// create reusable transporter object using the default SMTP transport
const transport = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  port: 465,
  secure: true,
  logger: true,
  debug: true,
  secureConnection: true,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  tls: {
    rejectUnAuthorized: true
  }

});

// Converting Stream to Buffer
const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on("data", (data) => buffers.push(data));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

// GetFile Content
const getFileContent = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const buffer = await streamToBuffer(fileStream);
  return buffer.toString();
};

// send mail with defined transport object
const sendEmails = async (to, subject, content, next) => {
  console.log(" Sending email to:", to); // Log the recipient email address

  try {
    const message = {
      from: {
        name: process.env.MAIL_FROM_NAME,
        address: process.env.MAIL_USERNAME,
      },
      to: to,
      subject: subject,
      html: content,
    };
    console.log("Sending email message:", message); // Log the email message before sending
    await transport.sendMail(message);
  }
  catch (error) {
    console.error(error);
    if (typeof next === "function") {
      next(error); // Call the callback function with the error
    }
  }
};

module.exports = {
  sendEmails,
  getFileContent,
};