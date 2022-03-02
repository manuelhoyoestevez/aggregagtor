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

const getMeasuresIds = async measures => {
    if (measures.length === 0) {
        return {};
    }

    const index = {};
    const measuresNoRepeat = []

    for (const measure of measures) {
        if (index[measure] === undefined) {
            measuresNoRepeat.push(measure);
            index[measure] = null;
        }
    }

    const query =  `SELECT "idMeasure", "Name"
                    FROM bjumperv2."Measure"
                    WHERE "Name" IN (${measuresNoRepeat.map(measure => `'${measure}'`).join(',')})`;

    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(query);

    for (const row of result.rows) {
        index[row.Name] = row.idMeasure;
    }

    for (const [name, idMeasure] of Object.entries(index)) {
        if (idMeasure === null) {
            throw new Error('Unknown measure: ' + name);
        }
    }

    return index;
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

const getSystemItems = async (originSystemId) => {
    const query =  `SELECT 
                        X."idItem" AS "id",
                        X."idIteminOrigin" AS "originId",
                        I."Name" AS name,
                        I."idItemClass" AS "itemClassId",
                        I."idParent" as "parentId",
                        Y."idIteminOrigin" AS "originParentId",
                        I."Active" AS "active",
                        NULL AS "action"
                    FROM bjumperv2."OriginSystem-Item" X
                        LEFT OUTER JOIN bjumperv2."Item" I ON X."idItem" = I."idItem"
                        LEFT OUTER JOIN bjumperv2."OriginSystem-Item" Y ON I."idParent" = Y."idItem"
                    WHERE X."idOriginSystem" = ${originSystemId}`;

    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(query);
    return result.rows;
};

const mapItemForInsert = (idOriginSystem, { name, itemClassId, originParentId, active }) => '('
    + `'${name}', `
    + `${itemClassId}, `
    + (originParentId ? `(SELECT "idItem" FROM bjumperv2."OriginSystem-Item" WHERE "idOriginSystem" = ${idOriginSystem} AND "idIteminOrigin" = '${originParentId}'), ` : 'NULL, ')
    + `${active}`
    + ')';

const mapItemOriginSystemForInsert = (idOriginSystem, { originId, id }) => '('
    + `'${originId}', `
    + `${idOriginSystem}, `
    + `${id}`
    + ')';

const insertItems = async (items, idOriginSystem) => {
    if (items.length === 0) {
        return null;
    }

    const insertA = 'INSERT INTO bjumperv2."Item"("Name", "idItemClass", "idParent", "Active")'
    + ' VALUES\n' + items.map(item => mapItemForInsert(idOriginSystem, item)).join(',\n') + '\nRETURNING "idItem";';

    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(insertA);

    for (let i = 0; i < result.rows.length; i++) {
        items[i].id = result.rows[i].idItem;
    }

    const insertB = 'INSERT INTO bjumperv2."OriginSystem-Item"("idIteminOrigin", "idOriginSystem", "idItem")'
    + ' VALUES\n' + items.map(item => mapItemOriginSystemForInsert(idOriginSystem, item)).join(',\n') + ';';

    return await postgresClient.query(insertB);
};

const mapItemForUpdate = (idOriginSystem, { id, name, itemClassId, originParentId, active }) => 
    'UPDATE bjumperv2."Item" SET '
    + `"Name" = '${name}',`
    + `"idItemClass" = ${itemClassId},`
    + '"idParent" = ' + (originParentId ? `(SELECT "idItem" FROM bjumperv2."OriginSystem-Item" WHERE "idOriginSystem" = ${idOriginSystem} AND "idIteminOrigin" = '${originParentId}'), ` : 'NULL, ')
    + `"Active" = ${active} `
    + `WHERE "idItem" = ${id};`;

const updateItems = async (items, idOriginSystem) => {
    if (items.length === 0) {
        return null;
    }

    const query = items.map(item => mapItemForUpdate(idOriginSystem, item)).join('\n');
    const postgresClient = await postgrePromise;
    return await postgresClient.query(query);
};

const mapItemForMeasureValue = ({ itemIdInOrigin, originSystemId, measureId, value, timestamp }) =>
    '(' 
    + `(SELECT "idItem" FROM bjumperv2."OriginSystem-Item" WHERE "idIteminOrigin" = '${itemIdInOrigin}' AND "idOriginSystem" = ${originSystemId}),`
    + `${measureId},`
    + `${originSystemId},`
    + `'${value}',`
    + `'${timestamp}'`
    + ')';

const insertMeasures = async (dataItems, originSystemId, measuresIds) => {
    if (dataItems.length === 0) {
        return null;
    }

    const measures = [];

    for(const dataItem of dataItems) {
        for (const measure of dataItem.measures) {
            measures.push({ measureId: measuresIds[measure.name], itemIdInOrigin: dataItem.idItem, originSystemId, ...measure });
        }
    }

    if (measures.length === 0) {
        return null;
    }

    const query = 'INSERT INTO bjumperv2."MeasureValue" ("idItem", "idMeasure", "idOriginSystem", "Value", "MeasureTimestamp")'
    + ' VALUES \n' + measures.map(mapItemForMeasureValue).join(',\n') + ';';

    const postgresClient = await postgrePromise;
    return await postgresClient.query(query);
};

const deactivateItems = async dataItemsIds => {
    if (dataItemsIds.length === 0) {
        return null;
    }

    const query = 'UPDATE bjumperv2."Item" SET "Active" = false '
    + `WHERE "idItem" IN (${dataItemsIds.map(dataItemId => `'${dataItemId}'`).join(',')});`;
    const postgresClient = await postgrePromise;
    return await postgresClient.query(query);
};

const deleteAll = async originSystemId => {
    const postgresClient = await postgrePromise;

    // Borrar medidas
    await postgresClient.query(`DELETE FROM bjumperv2."MeasureValue" WHERE "idOriginSystem" = ${originSystemId};`);

    // Sacar ids a eliminar
    const result = await postgresClient.query(`SELECT "idItem" AS "id" FROM bjumperv2."OriginSystem-Item" WHERE "idOriginSystem" = ${originSystemId};`);
    const itemIds = result.rows.map(({ id }) => id);

    if (itemIds.length > 0) {
        await postgresClient.query(`DELETE FROM bjumperv2."OriginSystem-Item" WHERE "idItem" IN (${itemIds.map(id => `'${id}'`).join(',')});`);
        await postgresClient.query(`DELETE FROM bjumperv2."Item" WHERE "idItem" IN (${itemIds.map(id => `'${id}'`).join(',')});`);
    }
};

module.exports = { getOriginSystemId, getItemClasses, getMeasuresIds, getSystemItems, insertItems, updateItems, insertMeasures, deactivateItems, deleteAll };
