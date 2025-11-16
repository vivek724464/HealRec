const { publishEvent } = require("../../../Shared/RabbitMQ/publisher");
const {ROUTING_KEYS_OBJ} = require("../../../Shared/RabbitMQ/events");

const RABBIT_URL = process.env.RABBITMQ_URL;

async function publishFollowAccepted(doctorId, patientId) {
  try {
    await publishEvent(RABBIT_URL, ROUTING_KEYS_OBJ.FOLLOW_ACCEPTED, { doctorId, patientId });
  } catch (err) {
    console.log("publishFollowAccepted error:", err);
  }
}

async function publishFollowRevoked(doctorId, patientId) {
  try {
    await publishEvent(RABBIT_URL, ROUTING_KEYS_OBJ.FOLLOW_REVOKED, { doctorId, patientId });
  } catch (err) {
    console.log("publishFollowRevoked error:", err);
  }
}

module.exports = {
  publishFollowAccepted,
  publishFollowRevoked,
};