const postgrePromise = require('../database');

const getOriginSystemId = originSystem => {
    const query = `SELECT "idOriginSystem" FROM bjumperv2."OriginSystem" WHERE "Name" = '${originSystem}'`;
    return new Promise((resolve, reject) => {
        postgrePromise
        .then(postgresClient => postgresClient.query(query))
        .then(result => {
            if (result.rows.length != 1) {
                return reject(`Invalid Origin System: ${originSystem} (${result.rows.length} rows fetched)`);
            }
    
            return resolve(result.rows[0]['idOriginSystem']);
        });
    });
};

const getItemClasses = itemClasses => {
    // Índice itemclass: idItemClass
    // Es un objeto cuyas claves son los distintos itemClass (row, rack, etc) y sus valores son sus respectivos IDs en base de datos
    const index = {};

    // Primero recorremos el array 'itemClasses' para quitar duplicados y dejar 'itemClassesNoRepeat' sin duplicados
    const itemClassesNoRepeat = []

    for (const itemClass of itemClasses) {
        if (index[itemClass] === undefined) {
            itemClassesNoRepeat.push(itemClass);
            index[itemClass] = null;
        }
    }

    const query = `SELECT "idItemClass", "Name" FROM bjumperv2."ItemClass" WHERE "Name" IN (${itemClassesNoRepeat.map(itemClass => `'${itemClass}'`).join(',')})`;

    return new Promise((resolve, reject) => {
        postgrePromise
        .then(postgresClient => postgresClient.query(query))
        .then(result => {
            for (const row of result.rows) {
                index[row.Name] = row.idItemClass;
            }

            for (const [itemClass, number] of Object.entries(index)) {
                if (number === null) {
                    return reject('Unknown item class: ' + itemClass);
                }
            }

            return resolve(index);
        });
    });
};

const getMeasuresIds = measures => {
    const index = {};
    const measuresNoRepeat = []

    for (const measure of measures) {
        if (index[measure] === undefined) {
            measuresNoRepeat.push(measure);
            index[measure] = null;
        }
    }

    const query = `SELECT "idMeasure", "Name" FROM bjumperv2."Measure" WHERE "Name" IN (${measuresNoRepeat.map(measure => `'${measure}'`).join(',')})`;

    return new Promise((resolve, reject) => {
        postgrePromise
        .then(postgresClient => postgresClient.query(query))
        .then(result => {
            for (const row of result.rows) {
                index[row.Name] = row.idMeasure;
            }

            for (const [name, idMeasure] of Object.entries(index)) {
                if (idMeasure === null) {
                    return reject('Unknown measure: ' + name);
                }
            }

            return resolve(index);
        });
    });
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