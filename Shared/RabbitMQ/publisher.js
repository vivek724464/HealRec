const { initRabbitMQ, publish } = require("./index");

async function publishEvent(rabbitUrl, routingKey, payload) {
  if (!rabbitUrl) throw new Error("rabbitUrl is required");
  await initRabbitMQ(rabbitUrl);
  return publish(routingKey, payload);
}

module.exports = { publishEvent };
