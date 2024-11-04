const agoraAccessToken = require('agora-access-token');
const jwt = require('jsonwebtoken');

// Generate Agora token
function generateAgoraToken(appId, appCertificate, channelName, uid, role) {
  const expirationTimeInSeconds = 3600; // 1 hour

  // Generate a unique token
  const token = agoraAccessToken.RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimeInSeconds
  );

  // Sign the token using JWT
  // const agoraToken = jwt.sign(token, appCertificate);

  return token;
}

module.exports = generateAgoraToken;
