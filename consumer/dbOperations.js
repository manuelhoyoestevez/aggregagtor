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

const getMeasuresIds = async measures => {
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

const getSystemItemsIndex = async originSystemId => {
    const index = {};

    const query =  `SELECT 
                        X."idItem" AS "id",
                        X."idIteminOrigin" AS "originId",
                        I."Name" AS name,
                        I."idItemClass" AS "itemClassId",
                        I."idParent" as "parentId",
                        I."Active" AS "active",
                        Y."idIteminOrigin" AS "originParentId"
                    FROM bjumperv2."OriginSystem-Item" X 
                        LEFT OUTER JOIN bjumperv2."Item" I ON X."idItem" = I."idItem"
                        LEFT OUTER JOIN bjumperv2."OriginSystem-Item" Y ON I."idParent" = Y."idItem"
                    WHERE X."idOriginSystem" = ${originSystemId}`;

    const postgresClient = await postgrePromise;
    const result = await postgresClient.query(query);

    for (const row of result.rows) {
        index[row.idIteminOrigin] = {
            newActive: false,
            ...row,
        };
    }

    return index;
};

//const createItems;
//const updateItems;
//const deactivateItems;

module.exports = { getOriginSystemId, getItemClasses, getMeasuresIds, getSystemItemsIndex }