const { insertBBDDITA } = require('../insertBBDD/insertPostgreSQL');

async function consumeMessages(postgresClient, rabbitChannel, queueName) {
    await rabbitChannel.consume(queueName, async function(msg) {
        //console.log(" [x] Received %s", msg.content.toString());
        
        const dato = JSON.parse(msg.content);

        switch (dato.type){        
            case 'AgregadorITA':
                await insertBBDDITA (postgresClient, dato);
                break;                         
            default:
                console.error("tipo desconocido: " + dato);
        }        
        rabbitChannel.ack(msg); 
    }, { noAck: false })
    .catch(err => {
        console.error(' # ERROR consume: ' + err.toString());
    });
};

module.exports = {consumeMessages};