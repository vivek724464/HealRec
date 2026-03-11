const { publishEvent } = require("../../../Shared/RabbitMQ/publisher");
const { ROUTING_KEYS_OBJ } = require("../../../Shared/RabbitMQ/events");

const RABBIT_URL = process.env.RABBITMQ_URL;

async function publishFollowAccepted(
  doctorId,
  patientId,
  { doctorName, patientName } = {}
) {
  return publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_ACCEPTED,
    { doctorId, patientId, doctorName, patientName }
  );
}

async function publishFollowUnfollowed(
  doctorId,
  patientId,
  { doctorName, patientName } = {}
) {
  return publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_UNFOLLOWED,
    { doctorId, patientId, doctorName, patientName }
  );
}

async function publishFollowRevoked(
  doctorId,
  patientId,
  { doctorName, patientName } = {}
) {
  return publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_REVOKED,
    { doctorId, patientId, doctorName, patientName }
  );
}

// new helper for request event
async function publishFollowRequest(
  doctorId,
  patientId,
  { patientName, doctorName } = {}
) {
  return publishEvent(
    RABBIT_URL,
    ROUTING_KEYS_OBJ.FOLLOW_REQUEST,
    { doctorId, patientId, patientName, doctorName }
  );
}

module.exports = {
  publishFollowAccepted,
  publishFollowUnfollowed,
  publishFollowRevoked,
  publishFollowRequest,
};
