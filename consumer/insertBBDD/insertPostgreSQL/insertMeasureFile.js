
async function insertMeasureDC(postgresClient,dataDC) {
    
    let insertSqlPUE = 'INSERT INTO bjumperv2."MeasureValue"("idItem","idMeasure","Value","MeasureTimestamp","idOriginSystem") VALUES '
    
    primero = true;      

    for (let data of dataDC) {       
        if (primero) {
            primero = false;
        } else {
            insertSqlPUE += ', '
            
        }   

        insertSqlPUE += `((SELECT "idItem" from bjumperv2."Item" WHERE "Name" ='${data.DC}'),
        (SELECT "idMeasure" from bjumperv2."Measure" WHERE "Name" ='PUE'), 
        '${data.PUE}',
        '${data.Timestamp}',
        (SELECT "idOriginSystem" from bjumperv2."OriginSystem" WHERE "Name" ='File'))`
        ;        

    }
    
    await postgresClient.query(insertSqlPUE +';');
    
}
module.exports = { insertMeasureDC}