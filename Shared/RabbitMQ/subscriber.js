const { initRabbitMQ } = require("./index");
const { EXCHANGE_NAME } = require("./events");

async function subscribe(rabbitUrl, queueName, routingKeys = [], onMessage) {
  if (!rabbitUrl) {
    throw new Error("❌ rabbitUrl is required");
  }
  if (!queueName) {
    throw new Error("❌ queueName is required");
  }
  if (typeof onMessage !== "function") {
    throw new Error("❌ onMessage must be a function");
  }

  const { channel } = await initRabbitMQ(rabbitUrl);
  if (!routingKeys) routingKeys = [];
  if (typeof routingKeys === "string") routingKeys = [routingKeys];
  if (typeof routingKeys === "object" && !Array.isArray(routingKeys)) {
    routingKeys = Object.values(routingKeys);
  }
  if (!Array.isArray(routingKeys)) {
    throw new Error("❌ routingKeys must be array/string/object");
  }
  await channel.assertQueue(queueName, { durable: true });
  for (const key of routingKeys) {
    await channel.bindQueue(queueName, EXCHANGE_NAME, key);
  }
  await channel.consume(
    queueName,
    async (msg) => {
      if (!msg) return;
      try {
        const routingKey = msg.fields.routingKey;
        const content = JSON.parse(msg.content.toString());
        await onMessage(content, routingKey, msg);
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Error in subscriber onMessage:", err);
        try {
          channel.nack(msg, false, false);
        } catch (e) {
          console.error("Failed to nack message:", e);
          try {
            channel.ack(msg);
          } catch (_) {}
        }
      }
    },
    { noAck: false }
  );

  return true;
}

module.exports = { subscribe };
