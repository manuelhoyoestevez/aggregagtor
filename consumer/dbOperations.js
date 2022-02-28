const postgrePromise = require('../database');

const getOriginSystemId = async originSystem => {
    const query =  `SELECT "idOriginSystem"
                    FROM bjumperv2."OriginSystem"
                    WHERE "Name" = '${originSystem}'`;

    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(query);

    if (result.rows.length != 1) {
        throw new Error(`Invalid Origin System: ${originSystem} (${result.rows.length} rows fetched)`);
    }

    return result.rows[0]['idOriginSystem'];
};

const getItemClasses = async itemClasses => {
    if (itemClasses.length === 0) {
        return {};
    }

    // Índice itemclass: idItemClass
    // Es un objeto cuyas claves son los distintos itemClass (row, rack, etc) y sus valores son sus respectivos IDs en base de datos
    const index = {};

    // Primero recorremos el array 'itemClasses' para dejar 'itemClassesNoRepeat' sin duplicados
    const itemClassesNoRepeat = []

    for (const itemClass of itemClasses) {
        if (index[itemClass] === undefined) {
            itemClassesNoRepeat.push(itemClass);
            index[itemClass] = null;
        }
    }

    const query =  `SELECT "idItemClass", "Name"
                    FROM bjumperv2."ItemClass"
                    WHERE "Name" IN (${itemClassesNoRepeat.map(itemClass => `'${itemClass}'`).join(',')})`;
    
    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(query);

    for (const row of result.rows) {
        index[row.Name] = row.idItemClass;
    }

    for (const [itemClass, itemClassId] of Object.entries(index)) {
        if (itemClassId === null) {
            throw new Error('Unknown item class: ' + itemClass);
        }
    }
    return index;
};

const getSystemItemsIndex = async originSystemId => {
    const index = {};

    const query =  `SELECT 
                        I."idItem" AS "id",
                        I."idIteminOrigin" AS "originId",
                        I."Name" AS name,
                        I."idItemClass" AS "itemClassId",
                        I."idParent" as "parentId",
                        I."Active" AS "active",
                        P."idIteminOrigin" AS "originParentId"
                    FROM bjumperv2."Item" I
                        LEFT OUTER JOIN bjumperv2."Item" P ON I."idParent" = P."idItem"
                    WHERE I."idOriginSystem" = ${originSystemId}`;

    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(query);

    for (const row of result.rows) {
        index[row.originId] = {
            newActive: false,
            ...row,
        };
    }

    return index;
};

const mapItemForInsert = 
    ({ Name, idItemClass, idIteminOrigin, idOriginSystem, idParent, Active }) => 
    `('${Name}', ${idItemClass}, '${idIteminOrigin}', ${idOriginSystem}, ${idParent}, ${Active})`;

const insertItems = async items => {
    if (items.length === 0) {
        return null;
    }

    const query = 'INSERT INTO bjumperv2."Item"("Name", "idItemClass", "idIteminOrigin", "idOriginSystem", "idParent", "Active")'
    + ' VALUES ' + items.map(mapItemForInsert).join(',') + ';';
    const postgresClient = await postgrePromise;
    return await postgresClient.query(query);
};

const mapItemForUpdate = 
    ({ idItem, Name, idItemClass, idParent, Active }) => 
    'UPDATE bjumperv2."Item" SET '
    + `"Name" = '${Name}',`
    + `"idItemClass" = ${idItemClass},`
    + `"idParent" = ${idParent},`
    + `"Active" = ${Active} `
    + `WHERE "idItem" = ${idItem};`;

const updateItems = async items => {
    if (items.length === 0) {
        return null;
    }

    const query = items.map(mapItemForUpdate).join('\n');
    const postgresClient = await postgrePromise;
    return await postgresClient.query(query);
};

const mapItemForMeasure = ({ itemIdInOrigin, originSystemId, name, value, timestamp }) =>
    '(' 
    + `(SELECT "idItem" FROM bjumperv2."Item" WHERE "idIteminOrigin" = '${itemIdInOrigin}' AND "idOriginSystem" = ${originSystemId}),`
    + `(SELECT "idMeasure" FROM bjumperv2."Measure" WHERE "Name" = '${name}'),`
    + `'${value}',`
    + `'${timestamp}'`
    + ')';

const insertMeasures = async (dataItems, originSystemId) => {
    if (dataItems.length === 0) {
        return null;
    }

    const measures = [];

    for(const dataItem of dataItems) {
        for (const measure of dataItem.measures) {
            measures.push({ itemIdInOrigin: dataItem.idItem, originSystemId, ...measure });
        }
    }

    const query = 'INSERT INTO bjumperv2."MeasureValue" ("idItem", "idMeasure", "Value", "MeasureTimestamp")\n'
    + ' VALUES ' + measures.map(mapItemForMeasure).join(',\n') + ';'
    const postgresClient = await postgrePromise;
    return await postgresClient.query(query);
}

module.exports = { getOriginSystemId, getItemClasses, getSystemItemsIndex, insertItems, updateItems, insertMeasures };
