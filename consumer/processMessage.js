const { getOriginSystemId, getItemClasses, getSystemItemsIndex, insertItems, updateItems, insertMeasures } = require('./dbOperations');

const processMessage = async ({ originSystem, dataItems }) => {
    const originSystemId = await getOriginSystemId(originSystem);

    const itemClasses = [];
    const measures = [];

    for(const dataItem of dataItems) {
        itemClasses.push(dataItem.itemClass);
        for (const measure of dataItem.measures) {
            measures.push(measure.name);
        }
    }

    const itemClassesIds = await getItemClasses(itemClasses);
    const systemItemsIndex = await getSystemItemsIndex(originSystemId);
    const systemItemsToCreate = [];
    const systemItemsToUpdate = [];
    
    for(const dataItem of dataItems) {
        const systemItem = systemItemsIndex[dataItem.idItem];

        if (systemItem === undefined) {
            // El item no existe en el sitema, se marca para crear
            systemItemsToCreate.push({
                Name: dataItem.name,
                idItemClass: itemClassesIds[dataItem.itemClass],
                idIteminOrigin: dataItem.idItem,
                idOriginSystem: originSystemId,
                idParent: null,
                Active: true
            });

        } else if (areNotEqual(dataItem, systemItem)) {
            systemItem.newActive = true;
            systemItemsToUpdate.push({
                idItem: systemItem.id,
                idItemClass: itemClassesIds[dataItem.itemClass],
                Name: dataItem.name,
                idParent: null,
                Active: true
            });
        }
    }

    await insertItems(systemItemsToCreate);
    await updateItems(systemItemsToUpdate);
    await insertMeasures(dataItems, originSystemId);
};

const areNotEqual = (dataItem, systemItem) => {
    
    console.log('dataItem', dataItem);
    console.log('systemItem', systemItem);

    return dataItem.name != systemItem.name
    || itemClassesIds[dataItem.itemClass] != systemItem.idItemClass
    || dataItem.parentIdItem != systemItem.originParentId
    || systemItem.active == false;
};

module.exports = { processMessage };
