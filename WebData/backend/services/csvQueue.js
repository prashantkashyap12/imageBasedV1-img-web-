const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisOptions = {
  host: "127.0.0.1", // Redis runs on localhost
  port: 6379, // Default Redis port
};

const connection = new Redis(redisOptions);

const updateQueue = new Queue("csvUpdateQueue", { connection });

module.exports = updateQueue;
