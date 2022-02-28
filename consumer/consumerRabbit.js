const { processMessage } = require('./processMessage');

async function consumeMessages(rabbitChannel, queueName) {
    
    await rabbitChannel.consume(queueName, async msg => {
        //console.log(" [x] Received %s", msg.content.toString());
        
        const message = JSON.parse(msg.content);

        try {
            await processMessage(message);
        } catch(err) {
            console.error('Processing Message', err);
        }

        rabbitChannel.ack(msg); 

    }, { noAck: false });
};

module.exports = { consumeMessages };
