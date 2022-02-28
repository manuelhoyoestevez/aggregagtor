const { getOriginSystemId, getItemClasses, getMeasuresIds, getSystemItemsIndex, insertItems, updateItems, insertMeasures, deactivateItems } = require('./dbOperations');

const processMessage = async ({ originSystem, dataItems }) => {
    // Obtener un índice con todos los IDs de los item classes en un objeto { dataItem: dataItemId }, ejemplo: { Datacenter: 1, Row: 3 }
    // Si aparece un itemClass desconocido, se produce un error
    const itemClassesIds = await getItemClasses(
        dataItems
            .map(dataItem => dataItem.itemClass)
    );

console.log('itemClassesIds', itemClassesIds);

    // Obtener un índice todos loss measures utilizadas en un objeto { measure: measureId}, ejemplo: { PUE: 38 }
    // Si aparece una measure desconocida, se produce un error

    const measuresIds = await getMeasuresIds(
        dataItems
            .map(dataItem => dataItem.measures)
            .reduce((previousMeasures, currentMeasures) => previousMeasures.concat(currentMeasures), [])
            .map(measure => measure.name)
    );

console.log('measuresIds', measuresIds);

    // Obtener el ID del sistema origen, ejemplo: ITA: 4
    // Si el origin system es desconocido, se produce un error
    const originSystemId = await getOriginSystemId(originSystem);

console.log('originSystem', originSystem);
console.log('originSystemId', originSystemId);

    // Obtener un índice por ID en origen de todos los items de ese origen,
    /*
    { 
        originId: {           ID en origen, que para el 'originSystemId', debe ser único
            id:               ID en sistema
            originId:         ID en origen, que para el 'originSystemId', debe ser único
            name:             Nombre
            itemClassId:      ID del ItemClass
            originParentId:   ID del padre en origin, o null si no está
            parentId:         ID del padre en sistema, o null si no está
            active:           Indicador de actividad
            deactivate:       Indicador de si debe ser desactivado, true en principio
        },
        ...
    }
    */
    const systemItemsIndex = await getSystemItemsIndex(originSystemId);

console.log('systemItemsIndex', systemItemsIndex);

    // Recorrido de los items que tenemos almacenados en el sistema para el originSystem
    const systemItemsToCreate = [];
    const systemItemsToUpdate = [];

    for(const dataItem of dataItems) {
        // Recuperación del item en sistema del índice
        const systemItem = systemItemsIndex[dataItem.idItem];

        if (systemItem === undefined) {
            // El item no existe en el sitema, se añade para crearlo
            systemItemsToCreate.push({
                Name: dataItem.name,
                idItemClass: itemClassesIds[dataItem.itemClass],
                idIteminOrigin: dataItem.idItem,
                idOriginSystem: originSystemId,
                idParent: null,
                Active: true
            });

        } else if (areNotEqual(dataItem, systemItem)) {
            // El item existe en el sitema y ha cambiado, se añade para modificarlo
            systemItemsToUpdate.push({
                idItem: systemItem.id,
                idItemClass: itemClassesIds[dataItem.itemClass],
                Name: dataItem.name,
                idParent: null,
                Active: true
            });

            // Se marca el item de sistema para que no sea desactivado
            systemItem.deactivate = false;
        }
        // En cualquier otro caso, ese item queda intacto y no se realiza ninguna acción
    }

console.log('systemItemsToCreate', systemItemsToCreate);
console.log('systemItemsToUpdate', systemItemsToUpdate);

    // Quedan los items de sistema que no están en dataItems: son los que tienen deactivate = true
    // Se obtiene su ID para poder desactivarlo
    const toDeactivate = Object.values(systemItemsIndex)
        .filter(systemItem => systemItem.deactivate)
        .map(systemItem => systemItem.id);

console.log('toDeactivate', toDeactivate);

    // Ejecutar acciones sobre la base de datos
    await insertItems(systemItemsToCreate);
    await updateItems(systemItemsToUpdate);
    await deactivateItems(toDeactivate);
    await insertMeasures(dataItems, originSystemId, measuresIds);
};

const areNotEqual = (dataItem, systemItem) => {

console.log('dataItem', dataItem);
console.log('systemItem', systemItem);

    return true;
    return dataItem.name != systemItem.name
    || itemClassesIds[dataItem.itemClass] != systemItem.idItemClass
    || dataItem.parentIdItem != systemItem.originParentId
    || systemItem.active == false;
};

module.exports = { processMessage };
