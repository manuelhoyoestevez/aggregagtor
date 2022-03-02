const { getOriginSystemId, getItemClasses, getMeasuresIds, getSystemItems, insertItems, updateItems, insertMeasures, deactivateItems } = require('./dbOperations');
const { reorderItems } = require('./reorderItems');

const processMessage = async ({ originSystem, dataItems }) => {
    // Obtener el ID del sistema origen, ejemplo: ITA: 4
    // Si el origin system es desconocido, se produce un error
    const originSystemId = await getOriginSystemId(originSystem);

    // Obtener un índice con todos los IDs de los item classes en un objeto { dataItem: dataItemId }, ejemplo: { Datacenter: 1, Row: 3 }
    // Si aparece un itemClass desconocido, se produce un error
    const itemClassesIds = await getItemClasses(
        dataItems
            .map(dataItem => dataItem.itemClass)
    );

    // Obtener un índice todos loss measures utilizadas en un objeto { measure: measureId}, ejemplo: { PUE: 38 }
    // Si aparece una measure desconocida, se produce un error
    const measuresIds = await getMeasuresIds(
        dataItems
            .map(dataItem => dataItem.measures)
            .reduce((previousMeasures, currentMeasures) => previousMeasures.concat(currentMeasures), [])
            .map(measure => measure.name)
    );

    // Generamos un índice de items para poder controlarlos y determinar correctamente la acción adecuada
    /*
    { 
        [originId]: {         ID en origen
            id:               ID en sistema
            originId:         ID en origen
            name:             Nombre
            itemClassId:      ID del ItemClass
            originParentId:   ID del padre en origin, o null si no está
            parentId:         ID del padre en sistema, o null si no está
            active:           Indicador de actividad
            action:           Acción a realizar: create, update, deactivate o none
        },
        ...
    }
    */
    const itemIndex = dataItems.reduce((prev, { idItem, name, itemClass, parentIdItem }) => (
        {
            ...prev,
            [idItem]: {
                id: null,
                originId: idItem,
                name: name,
                itemClassId: itemClassesIds[itemClass],
                parentId: null,
                originParentId: parentIdItem,
                active: true,
                action: 'create'
            }
        }
    ), {});

//console.log('itemIndex (1)', itemIndex);

    const systemItems = await getSystemItems(originSystemId);

//console.log('systemItems', systemItems);

    for (const systemItem of systemItems) {
        // Caso A: el item está en el sistema y ha dejado de venir:
        // - si esta activo, se desactiva
        // - en caso contrario no se hace nada
        if (itemIndex[systemItem.originId] === undefined) {
            if(systemItem.active) {
                itemIndex[systemItem.originId] = { ...systemItem, action: 'deactivate' };
                itemIndex[systemItem.originId].active = false;
            }
            else {
                itemIndex[systemItem.originId] = { ...systemItem, action: 'none' };
            }
        }
        // Caso B: el item ha venido y es diferente: se actualiza
        else if(areNotEqual(itemIndex[systemItem.originId], systemItem)) {
            itemIndex[systemItem.originId].id = systemItem.id;
            itemIndex[systemItem.originId].action = 'update';
        }
        // Caso C: el item ha venido y no tiene cambios: no se hace nada
        else {
            itemIndex[systemItem.originId].id = systemItem.id;
            itemIndex[systemItem.originId].action = 'none';
        }
        // Caso D: el item no está en el sistema: se crea
    }

console.log('itemIndex (2)', JSON.stringify(itemIndex)); return;

    // Ahora con el índice con toda la información ya sabemos qué operación se debe realizar para cada item

    // Esta función y analiza la consistencia de los items:
    // - Comprueba que el padre exista en el sistema
    // - Comprueba que no haya ciclos
    // - Actualiza el índice con los IDs de los items internos creados
    // - Devuelve un array de grupos de items en el orden correcto para ser insertados
    const itemsGroupsToCreate = reorderItems(itemIndex);

console.log('itemsGroupsToCreate', itemsGroupsToCreate);

    // Creamos los items según los grupos obtenidos
    for(const itemsToCreate of itemsGroupsToCreate) {
        await insertItems(itemsToCreate, originSystemId);
    }

    // Actualizamos los items a actualizar
    const itemsToUpdate = Object.values(itemIndex)
        .filter(item => item.action === 'update');

console.log('itemsToUpdate', itemsToUpdate);

    await updateItems(itemsToUpdate, originSystemId);

    // Obtenemos los IDs de los item a desactivar y los desactivamos
    const idsToDeactivate = Object.values(itemIndex)
        .filter(item => item.action === 'deactivate')
        .map(item => item.id);

console.log('idsToDeactivate', idsToDeactivate);

    await deactivateItems(idsToDeactivate);
return;
    // Insertamos las medidas
    await insertMeasures(itemIndex, originSystemId, measuresIds);
};

const areNotEqual = (dataItem, systemItem) => {
    return dataItem.name != systemItem.name
    || dataItem.itemClassId != systemItem.itemClassId
    || dataItem.originParentId != systemItem.originParentId
    || dataItem.active != systemItem.active;
};

module.exports = { processMessage };
