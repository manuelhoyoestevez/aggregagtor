
const { insertMeasureRacks, insertMeasureRoom } = require('./insertMeasure.js')

async function insertBBDDITA(postgresClient, aggrData) {
    /*
    const newDcs = [];
    
    for (let data of aggrData.dataDC) {       
        let res = await postgresClient.query(`select * from bjumperv2."OriginSystem-Item" 
        WHERE "idIteminOrigin"= '${data.uuid}'`)

        if (res.rows.lenght !== 0) {
            newDcs.push(data);
        }
    }
    */

    //DATOS DC

    const dcIds = aggrData.dataDC.map(data => "'" + data.uuid + "'").join(",");
    
    let res = await postgresClient.query(
        `SELECT * FROM bjumperv2."OriginSystem-Item" WHERE "idIteminOrigin" IN (${dcIds})`
    );
    
    const newDcs = [];

    for (let aggrDcDatum of aggrData.dataDC) {
        if (res.rows.find(dc => dc.idIteminOrigin == aggrDcDatum.uuid) === undefined) {
            newDcs.push(aggrDcDatum);
        }
    }

    if (newDcs.length !== 0) {
        
        let insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass") VALUES ';
        let insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '

        let primero = true;

        for (let data of newDcs) {       
            if (primero) {
                primero = false;
            } else {
                insertSql += ', ';
                insertSqlOriginSystem += ', '
            }
            insertSql += `('${data.label}', (SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Datacenter'))`;
            insertSqlOriginSystem += `((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA'), (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),'${data.uuid}')`;
        }
        
        await postgresClient.query(insertSql +';');
        await postgresClient.query(insertSqlOriginSystem +';'); 
    }
    
    // Datos del ROOM
    const roomIds = aggrData.dataRooms.map(data => "'" + data.uuid + "'").join(",");

    res = await postgresClient.query(
        `SELECT * FROM bjumperv2."OriginSystem-Item" WHERE "idIteminOrigin" IN (${roomIds})`
    );

    const newRooms = [];

    for (let aggrRoomDatum of aggrData.dataRooms) {
        if (res.rows.find(room => room.idIteminOrigin == aggrRoomDatum.uuid) === undefined) {
            newRooms.push(aggrRoomDatum);
        }
    }    

    if (newRooms.length !== 0) {
        
        insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass","idParent") VALUES '      
        insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '
    
        primero = true;     
        
        for (let data of newRooms) {       
            if (primero) {
                primero = false;
            } else {
                insertSql += ', ';
                insertSqlOriginSystem += ', '
            }
            insertSql += `('${data.label}',( SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Room'),
                (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.p_dc}' AND "idItemClass" ='1'))`;
            
            insertSqlOriginSystem += `((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA'), 
                (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),'${data.uuid}')`;
        }        
    
        await postgresClient.query(insertSql + ';')
        await postgresClient.query(insertSqlOriginSystem +';'); 

    }    
    
  // Datos del ROW
    const roowIds = aggrData.dataRows.map(data => "'" + data.uuid + "'").join(",");
    
    res = await postgresClient.query(
        `SELECT * FROM bjumperv2."OriginSystem-Item" WHERE "idIteminOrigin" IN (${roowIds})`
    );

    const newRows = [];

    for (let aggrRowDatum of aggrData.dataRows) {
        if (res.rows.find(row => row.idIteminOrigin == aggrRowDatum.uuid) === undefined) {
            newRows.push(aggrRowDatum);
        }
    }   
        
    if (newRows.length !== 0) {
        insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass","idParent") VALUES '      
        insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '

        primero = true;     
        
        for (let data of newRows) {       
            if (primero) {
                primero = false;
            } else {
                insertSql += ', ';
                insertSqlOriginSystem += ', '
            }
            insertSql += `('${data.label}',( SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Row'),
                (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.p_room}' AND "idItemClass" ='2'))`;    
            
            insertSqlOriginSystem += `((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA'), 
                (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),'${data.uuid}')`;        
        }    

        await postgresClient.query(insertSql + ';')
        await postgresClient.query(insertSqlOriginSystem +';');
    }

    // Datos del RACK
    const rackIds = aggrData.dataRacks.map(data => "'" + data.uuid + "'").join(",");

    res = await postgresClient.query(
        `SELECT * FROM bjumperv2."OriginSystem-Item" WHERE "idIteminOrigin" IN (${rackIds})`
    );  

    const newRacks = [];

    for (let aggrRackDatum of aggrData.dataRacks) {
        if (res.rows.find(rack => rack.idIteminOrigin == aggrRackDatum.uuid) === undefined) {
            newRacks.push(aggrRackDatum);
        }
    } 

    if (newRacks.length !== 0) {
  
        insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass","idParent") VALUES '      
        insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '    

        primero = true;     
        
        for (let data of newRacks) {       
            if (primero) {
                primero = false;
            } else {
                insertSql += ', ';
                insertSqlOriginSystem += ', '         
            }

            insertSql += `('${data.label}',( SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Rack'),
                (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.row}' AND "idItemClass" ='3'))`;    

            insertSqlOriginSystem += `((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA'),
                (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),'${data.uuid}')`;           
    
        }

        await postgresClient.query(insertSql + ';')
        await postgresClient.query(insertSqlOriginSystem +';');
    }

    await insertMeasureRacks(postgresClient, aggrData.dataRacks)  
    await insertMeasureRoom(postgresClient)
}

module.exports = { insertBBDDITA }
 