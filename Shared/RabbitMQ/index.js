const amqplib = require("amqplib");
const { EXCHANGE_NAME } = require("./events");

let connection = null;
let channel = null;

async function initRabbitMQ(rabbitUrl) {
  if (channel && connection) return { connection, channel };

  if (!rabbitUrl) {
    console.log("rabbitUrl required for initRabbitMQ");
  }
  connection = await amqplib.connect(rabbitUrl);
  channel = await connection.createConfirmChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
  connection.on("error", (err) => {
    console.log("RabbitMQ connection error:", err.message);
  });
  connection.on("close", () => {
    console.log("RabbitMQ connection closed");
    channel = null;
    connection = null;
  });

  return { connection, channel };
}

async function publish(routingKey, payload, options = {}) {
  if (!channel) {
    console.log("RabbitMQ channel is not initialized. Call initRabbitMQ first.");
  }
  const buf = Buffer.from(JSON.stringify(payload));
  const published = channel.publish(EXCHANGE_NAME, routingKey, buf, Object.assign({ persistent: true }, options));
  await channel.waitForConfirms();
  return published;
}

async function close() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (err) {
    console.log(err.message);
  } finally {
    channel = null;
    connection = null;
  }
}

module.exports = { initRabbitMQ, publish, close };
