
async function insertMeasureRacks(postgresClient, dataRacks) {
    let insertSqlTotal_U = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES '
    let insertSqlUsed_U = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES  '
    let insertSqlFree_U = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES  '
    let insertSqlEmpty = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES '

    primero = true;     
    


    for (let data of dataRacks) {       
        if (primero) {
            primero = false;
        } else {
            insertSqlTotal_U += ', '
            insertSqlUsed_U += ', '
            insertSqlFree_U += ', '
            insertSqlEmpty += ', '
        }   

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
    
    await postgresClient.query(insertSqlTotal_U +';');
    await postgresClient.query(insertSqlUsed_U +';');
    await postgresClient.query(insertSqlFree_U +';');
    await postgresClient.query(insertSqlEmpty +';');
   
}


async function insertMeasureRoom(postgresClient) {
     
    const empty = ['true','false']
    let infoEmpty = []

    await Promise.all( empty.map(async (r) =>{

        const queryEmptyRackperRoom = `WITH RECURSIVE subordinates AS (
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


        let res = await postgresClient.query(queryEmptyRackperRoom)
        
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

}

module.exports = {insertMeasureRacks, insertMeasureRoom}