const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(phone, message) {
  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
}

module.exports.sendSMS = sendSMS;
