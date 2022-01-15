
const { insertMeasureRacks, insertMeasureRoom } = require('./insertMeasure.js')

async function insertBBDDITA(postgresClient, aggrData) {
    
    // Inserta datos  del datacenter
    let insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass") VALUES ';
    let insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '

    let primero = true;

    for (let data of aggrData.dataDC) {       
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

    // Inserta datos  del ROOM    
    insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass","idParent") VALUES '      
    insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '

    primero = true;     
    
    for (let data of aggrData.dataRooms) {       
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
    console.log("insertSql", insertSql)
    console.log("insertSql", insertSqlOriginSystem)

    await postgresClient.query(insertSql + ';')
    await postgresClient.query(insertSqlOriginSystem +';'); 

    // Inserta datos  del ROW

    insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass","idParent") VALUES '      
    insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '

    primero = true;     
    
    for (let data of aggrData.dataRows) {       
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
    console.log("insertSql", insertSql)
    console.log("insertSql", insertSqlOriginSystem)

    await postgresClient.query(insertSql + ';')
    await postgresClient.query(insertSqlOriginSystem +';');


     //Inserta datos  del Rack
  
    
    insertSql = 'INSERT INTO bjumperv2."Item"("Name","idItemClass","idParent") VALUES '      
    insertSqlOriginSystem = 'INSERT INTO bjumperv2."OriginSystem-Item"("idOriginSystem","idItem","idIteminOrigin") VALUES '    
    

    primero = true;     
    
    for (let data of aggrData.dataRacks) {       
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

    await insertMeasureRacks(postgresClient, aggrData.dataRacks)  
    await insertMeasureRoom(postgresClient)


}

module.exports = { insertBBDDITA }
 