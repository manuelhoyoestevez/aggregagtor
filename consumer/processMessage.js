const { getOriginSystemId, getItemClasses, getMeasuresIds, getSystemItemsIndex } = require('./dbOperations');

const processMessage = async ({ originSystem, dataItems }) => {

console.log('originSystem = ', originSystem);

    const originSystemId = await getOriginSystemId(originSystem);

console.log('originSystemId = ', originSystemId);

    const itemClasses = [];
    const measures = [];

    for(const dataItem of dataItems) {
        itemClasses.push(dataItem.itemClass);
        for (const measure of dataItem.measures) {
            measures.push(measure.name);
        }
    }

    const itemClassesIds = await getItemClasses(itemClasses);
    const measuresIds = await getMeasuresIds(measures);
    const systemItemsIndex = await getSystemItemsIndex(originSystemId);

console.log('itemClassesIds = ', itemClassesIds);
console.log('measuresIds = ', measuresIds);
console.log('systemItemsIndex = ', systemItemsIndex);

    const systemItemsToCreate = [];
    const systemItemsToUpdate = [];
    
    for(const dataItem of dataItems) {
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

console.log('systemItemsToCreate = ', systemItemsToCreate);
console.log('systemItemsToUpdate = ', systemItemsToUpdate);
};

module.exports = { processMessage };