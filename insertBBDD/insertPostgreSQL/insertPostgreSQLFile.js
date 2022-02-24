
const { insertMeasureDC } = require("./insertMeasureFile.js");

async function insertBBDDFile(postgresClient, aggrData) {
  console.log(" Mensaje en insertar", aggrData);
  let aggrDataArray = [];
  if (aggrData.dataDC) {
    
    if (!Array.isArray(aggrData.dataDC)) {
      aggrDataArray.push(aggrData.dataDC);
    } else {
      aggrDataArray = aggrData.dataDC;
    }

    const dcIds = aggrDataArray.map((data) => "'" + data.uuid + "'").join(",");

    const dcNames = aggrDataArray.map((data) => "'" + data.DC + "'").join(",");
    console.log("dcNames", dcNames);

    let query = ` SELECT I."idItemClass" AS class, I."Name" as name_item, origin."idOriginSystem", 
    origin."idIteminOrigin" 
        FROM bjumperv2."Item" as I INNER JOIN bjumperv2."ItemClass" AS IC 
        ON IC."idItemClass"= I."idItemClass" INNER JOIN bjumperv2."OriginSystem-Item" AS origin
        ON I."idItem" = origin."idItem" 
        WHERE ("idOriginSystem"= 3 AND I."idItemClass"= 1) AND 
        ("idIteminOrigin" IN (${dcIds}) OR I."Name" IN (${dcNames}))`;

    console.log("query", query);

    let res = await postgresClient.query(query);
    const newDcs = [];
    console.log("res", res.rows);

    for (let aggrDcDatum of aggrDataArray) {
      if (
        res.rows.find((dc) => dc.idIteminOrigin == aggrDcDatum.uuid) ===
        undefined
      ) {
        if (res.rows.find((dc) => dc.name_item == aggrDcDatum.DC) === undefined)
          newDcs.push(aggrDcDatum);
      }
    }

    if (newDcs.length !== 0) {

      let insertSql =
        'INSERT INTO bjumperv2."Item"("Name","idItemClass") VALUES ';
      let insertSqlOriginSystem =
        'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES ';

      let primero = true;

      for (let data of newDcs) {

        if (primero) {
          primero = false;
        } else {
          insertSql += ", ";
          insertSqlOriginSystem += ", ";
        }
        insertSql += `('${data.DC}', (SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Datacenter'))`;
        insertSqlOriginSystem += `((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='File'), 
            (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.DC}'),'${data.uuid}')`;
      }

      let insertA = await postgresClient.query(
        `INSERT INTO bjumperv2."Item"("Name","idItemClass") VALUES ('Bjumper Lab', (SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Datacenter')) RETURNING bjumperv2."Item"."idItem"`
      );

      console.log("insertA", insertA.rows[0].idItem);

      await postgresClient.query(`INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") 
        VALUES ((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='File'),
        (${insertA.rows[0].idItem}),'undefined')`);

      console.log("TERMINO DE QUERY item");
      //await postgresClient.query(`INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES ((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='File'),(SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='Bjumper Lab'),'undefined')`);

      console.log("TERMINO DE QUERY de origyn ");

      //await postgresClient.query(insertSql + ";");
      //await postgresClient.query(insertSqlOriginSystem + ";");
    }
  }
  if (aggrData.dataRooms) {
    console.log("HAYrooms", aggrData.dataRooms);
  }

  if (!aggrData.dataRows) {
    console.log("no hay ROWS", aggrData.dataRows);
  }

  if (!aggrData.dataRacks) {
    console.log("no hay RACKS", aggrData.dataRacks);
  }

  console.log("aggrDataArray", aggrDataArray);

  await insertMeasureDC(postgresClient, aggrDataArray);
}

module.exports = { insertBBDDFile };
