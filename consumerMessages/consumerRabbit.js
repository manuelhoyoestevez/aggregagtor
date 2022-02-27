//const { insertBBDDITA } = require('../insertBBDD/insertPostgreSQL/insertPostgreSQL');
//const { insertBBDDFile } = require('../insertBBDD/insertPostgreSQL/insertPostgreSQLFile');
const { getOriginSystemId, getItemClasses, getMeasuresIds, getSystemItemsIndex } = require('./dbOperations');

async function consumeMessages(postgresClient, rabbitChannel, queueName) {
    await rabbitChannel.consume(queueName, async function(msg) {
        //console.log(" [x] Received %s", msg.content.toString());
        
        const message = JSON.parse(msg.content);

        const originSystemId = await getOriginSystemId(message.originSystem);

        const itemClasses = [];
        const measures = [];

        for(const dataItem of message.dataItems) {
            itemClasses.push(dataItem.itemClass);
            for (const measure of dataItem.measures) {
                measures.push(measure.name);
            }
        }

        const itemClassesIds = await getItemClasses(itemClasses);
        const systemItemsIndex = await getSystemItemsIndex(originSystemId);
        const systemItemsToCreate = [];
        const systemItemsToUpdate = [];
        
        for(const dataItem of message.dataItems) {
            const systemItem = systemItemsIndex[dataItem.itemId];

            if (systemItem === undefined) {
                // El item no existe en el sitema, se marca para crear
                systemItemsToCreate.push({
                    idItemInOrigin: dataItem.itemId,
                    idItemClass: itemClassesIds[dataItem.itemClass],
                    Name: dataItem.name,
                    idParent: systemItemsIndex[dataItem.parentIdItem] || null,
                    idParentInOrigin: dataItem.parentIdItem || null, // Ojo aquí, el padre ha tenido que ser insertado antes
                    Active: true
                });

            // El item existe en el sitema: comprobar si hay cambios
            // - Si los hay, marcar para actualizar
            // - Si no los hay, marcar para no hacer nada
            } else if(dataItem.name != systemItem.name
                || itemClassesIds[dataItem.itemClass] != systemItem.idItemClass
                || dataItem.parentIdItem != systemItem.originParentId
                || systemItem.active == false
            ) {
                systemItemsToUpdate.push({
                    idItem: systemItem.idItem,
                    idItemClass: itemClassesIds[dataItem.itemClass],
                    Name: dataItem.name,
                    idParent: systemItemsIndex[dataItem.parentIdItem] || null,
                    idParentInOrigin: dataItem.parentIdItem || null, // Ojo aquí, el padre ha tenido que ser insertado antes
                    Active: true
                });
            }
        }

        const measuresIds = await getMeasuresIds(measures);
        
/*
        switch (dato.type){        
            case 'ITA':
                await insertBBDDITA (postgresClient, dato);
                break;                         
            case 'AgreggatorFile':
                await insertBBDDFile (postgresClient, dato);
                break;                         
            default:
                console.error("tipo desconocido: " + dato);
        }        */
        rabbitChannel.ack(msg); 
    }, { noAck: false })
    .catch(err => {
        console.error(' # ERROR consume: ' + err.toString());
    });
};

module.exports = {consumeMessages};
