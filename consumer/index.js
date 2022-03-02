const amqplib = require('amqplib');

const { rabbitURL } = require('../config');

const { consumeMessages } = require('./consumerRabbit');

const queueName = 'queue.agregador';

(async () => {
    try {
        const rabbitConnection = await amqplib.connect(rabbitURL, "heartbeat=60");
        const rabbitChannel = await rabbitConnection.createChannel();
        await rabbitChannel.assertQueue(queueName, {durable: true});

        console.log('RabbitMQ loaded!');
        await consumeMessages(rabbitChannel, queueName);
    } catch(err) {
        console.error('# ERROR: ' + err);
    }
})();
