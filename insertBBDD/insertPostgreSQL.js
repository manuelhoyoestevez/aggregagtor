async function insertBBDDITA(postgresClient, aggrData) {
     
    if (aggrData.dataDC) {
        console.log("dato de DC",aggrData.dataDC)
        await postgresClient.query(`DELETE FROM bjumper.dc; DELETE FROM bjumper.room; 
        DELETE FROM bjumper.row; DELETE FROM bjumper.rack`);
        for (let data of aggrData.dataDC) {            
            postgresClient.query(`
            INSERT INTO bjumper.dc(name, clientid) 
            VALUES ('${data.label}', '${data.uuid}')`)
        }
    } else if ( aggrData.dataRooms) {
        console.log("dato de ROomS", aggrData.dataRooms)
        
        for (let data of aggrData.dataRooms) {       
            console.log ("dato", data.p_uuid)       
             postgresClient.query(`
            INSERT INTO bjumper.room(parentid, name, clientid) 
            VALUES ((SELECT id from bjumper.dc WHERE clientid ='${data.p_uuid}'),'${data.label}', '${data.uuid}')`)          
        }
    } else if ( aggrData.dataRows) {
        console.log("dato de Rows", aggrData.dataRows)
        
        for (let data of aggrData.dataRows) {                     
            postgresClient.query(`
            INSERT INTO bjumper.row(parentid, name, clientid) 
            VALUES ((SELECT id from bjumper.room WHERE clientid='${data.parent_uuid}'),'${data.label}', '${data.uuid}')`)          
        }
    } else if ( aggrData.dataRacks) {
        console.log("dato de Racks", aggrData.dataRacks)
        
        for (let data of aggrData.dataRacks) {                     
            postgresClient.query(`
            INSERT INTO bjumper.rack(parentid, name, clientid, total_u, used_u, free_u) 
            VALUES ((SELECT id from bjumper.row WHERE name='${data.row}'),'${data.label}', '${data.uuid}',
            '${data.TOTAL_USPACE}', '${data.USED_USPACE}', '${data.AVAILABLE_USPACE}')`)          
        }
    }
}

module.exports = { insertBBDDITA }
 