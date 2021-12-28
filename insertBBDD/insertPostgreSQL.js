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
    let insertSqlTotal_U = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES '
    let insertSqlUsed_U = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES  '
    let insertSqlFree_U = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES  '
    let insertSqlEmpty = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES '

    primero = true;     
    
    for (let data of aggrData.dataRacks) {       
        if (primero) {
            primero = false;
        } else {
            insertSql += ', ';
            insertSqlOriginSystem += ', '
            insertSqlTotal_U += ', '
            insertSqlUsed_U += ', '
            insertSqlFree_U += ', '
            insertSqlEmpty += ', '
        }
        insertSql += `('${data.label}',( SELECT "idItemClass" from bjumperv2."ItemClass" WHERE "Name" ='Rack'),
            (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.row}' AND "idItemClass" ='3'))`;    

        insertSqlOriginSystem += `((SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA'),
            (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),'${data.uuid}')`;               

        insertSqlTotal_U += `((SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),
        (SELECT "idMeasure" from bjumperv2."Measure" WHERE "Name" ='Total_U'),
        '${data.TOTAL_USPACE}',
        '${data.timestamp}',
        (SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA')
        )`;        

        insertSqlUsed_U += `((SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),
        (SELECT "idMeasure" from bjumperv2."Measure" WHERE "Name" ='Used_U'),
        '${data.USED_USPACE}',
        '${data.timestamp}',
        (SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA')
        )`;        

        insertSqlFree_U += `((SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),
        (SELECT "idMeasure" from bjumperv2."Measure" WHERE "Name" ='Free_U'),
        '${data.AVAILABLE_USPACE}',
        '${data.timestamp}',
        (SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA')
        )`;        

        insertSqlEmpty += `((SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.label}'),
        (SELECT "idMeasure" from bjumperv2."Measure" WHERE "Name" ='Empty'),
        '${data.empty}',
        '${data.timestamp}',
        (SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA')
        )`;        

    }
    
    await postgresClient.query(insertSql + ';')
    await postgresClient.query(insertSqlOriginSystem +';');
    await postgresClient.query(insertSqlTotal_U +';');
    await postgresClient.query(insertSqlUsed_U +';');
    await postgresClient.query(insertSqlFree_U +';');
    await postgresClient.query(insertSqlEmpty +';');


    const empty = ['true','false']
    let infoEmpty = []

    await Promise.all( empty.map(async (r) =>{

        const queryRoomEmptyRack = `WITH RECURSIVE subordinates AS (
            SELECT
                "idItem", "Name", "idItemClass", "Name" as p_room, "idItem" as id_room
            FROM
                bjumperv2."Item"
            WHERE
                "idItemClass" = 2
            UNION
                SELECT
                    I."idItem", I."Name", I."idItemClass",  S.p_room, S.id_room
                FROM bjumperv2."Item" I INNER JOIN subordinates S ON I."idParent" = S."idItem"
        )
            SELECT S.id_room, S.p_room , count(MV."Value"), MV."Value" 
                FROM subordinates S INNER JOIN bjumperv2."MeasureValue" MV ON S."idItem" = MV."idItem"
                WHERE "idItemClass" = 4 AND "idMeasure" = 1	AND MV."Value"	= '${r}'
                group by MV."Value", p_room, S."id_room"`;


        let res = await postgresClient.query(queryRoomEmptyRack)
        
        infoEmpty = infoEmpty.concat(res.rows)
            
    }))

    console.log("resultado", infoEmpty)
    
    let insertSqlFreeUsedRackperRoom = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES '      

    primero = true;
    let measure = ''
        
    for (let data of infoEmpty) {       
        if (primero) {
            primero = false;
        } else {
            insertSqlFreeUsedRackperRoom += ', ';                
        }     

        if (data.Value === 'true'){
            measure = 'Free_R'
        } else {
            measure = 'Used_R'
        }

        insertSqlFreeUsedRackperRoom += ` (
        (SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.p_room}'),
        (SELECT "idMeasure" from bjumperv2."Measure" WHERE "Name" = '${measure}'),
        '${data.count}',
        now(),
        (SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='ITA')       
        ) `     
    }

    await postgresClient.query(insertSqlFreeUsedRackperRoom +';');

    //console.log("queryfreerack", insertSqlFreeUsedRackperRoom)  
            
    


}

module.exports = { insertBBDDITA }
 