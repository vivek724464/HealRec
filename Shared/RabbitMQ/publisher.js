const { initRabbitMQ, publish } = require("./index");

async function publishEvent(rabbitUrl, routingKey, payload) {
  try {
    if (!rabbitUrl) {
      console.warn("⚠️ RabbitMQ URL not provided. Skipping publish.");
      return;
    }

    await initRabbitMQ(rabbitUrl);
    return publish(routingKey, payload);

  } catch (err) {
    console.error("RabbitMQ publish error:", err.message);
    // Do NOT throw → prevent system crash
  }
}

module.exports = { publishEvent };
