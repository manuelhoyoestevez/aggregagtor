const amqplib = require('amqplib');
const { Client } = require('pg');

const { postgreConnection, rabbitURL } = require('./config')
console.log("postgreConnection", postgreConnection)
const { consumeMessages } = require('./consumerMessages/consumerRabbit');

const queueName = 'queue.agregador';

(async () => {
    try {
        const postgresClient = new Client(postgreConnection);
        await postgresClient.connect();
        console.log('Postgress loaded!');

        const rabbitConnection = await amqplib.connect(rabbitURL, "heartbeat=60");
        const rabbitChannel = await rabbitConnection.createChannel();
        await rabbitChannel.assertQueue(queueName, {durable: true});

        console.log('RabbitMQ loaded!');
        await consumeMessages(postgresClient, rabbitChannel, queueName);
    } catch(err) {
        console.error('# ERROR: ' + err);
    }
})();