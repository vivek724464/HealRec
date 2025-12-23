const { publishEvent } = require("../../../Shared/RabbitMQ/publisher");
const { ROUTING_KEYS_OBJ } = require("../../../Shared/RabbitMQ/events");

const RABBIT_URL = process.env.RABBITMQ_URL;

async function publishFollowAccepted(doctorId, patientId) {
  await publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_ACCEPTED,
    { doctorId, patientId }
  );
}

async function publishFollowUnfollowed(doctorId, patientId) {
  await publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_UNFOLLOWED,
    { doctorId, patientId }
  );
}

async function publishFollowRevoked(doctorId, patientId) {
  await publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_REVOKED,
    { doctorId, patientId }
  );
}

module.exports = {
  publishFollowAccepted,
  publishFollowUnfollowed,
  publishFollowRevoked,
};
