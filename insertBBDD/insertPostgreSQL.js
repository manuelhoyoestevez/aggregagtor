async function insertBBDDITA(postgresClient, aggrData) {
    console.log("data", aggrData)
    
    await postgresClient.query(` TRUNCATE TABLE bjumper.dc RESTART IDENTITY CASCADE; 
        TRUNCATE TABLE bjumper.room RESTART IDENTITY CASCADE;
        TRUNCATE TABLE bjumper.row RESTART IDENTITY CASCADE; 
        TRUNCATE TABLE bjumper.rack RESTART IDENTITY CASCADE;       
    `);

    let insertSql = 'INSERT INTO bjumper.dc(name, clientid) VALUES ';

    let primero = true;

    for (let data of aggrData.dataDC) {       
        if (primero) {
            primero = false;
        } else {
            insertSql += ', ';
        }
        insertSql += `('${data.label}', '${data.uuid}')`;
    }    

    await postgresClient.query(insertSql +';');

    insertSql = 'INSERT INTO bjumper.room(parentid, name, clientid) VALUES ';

    primero = true;    
    
    for (let data of aggrData.dataRooms) {       
        if (primero) {
            primero = false;
        } else {
            insertSql += ', ';
        }
        insertSql += `((SELECT id from bjumper.dc WHERE clientid ='${data.p_uuid}'),'${data.label}', '${data.uuid}')`;
    }

    await postgresClient.query(insertSql + ';')

    insertSql = 'INSERT INTO bjumper.row(parentid, name, clientid) VALUES ';

    primero = true;    
    
    for (let data of aggrData.dataRows) {       
        if (primero) {
            primero = false;
        } else {
            insertSql += ', ';
        }
        insertSql += `((SELECT id from bjumper.room WHERE clientid='${data.parent_uuid}'),'${data.label}', '${data.uuid}')`;
    }

    await postgresClient.query(insertSql + ';')

    insertSql = 'INSERT INTO bjumper.rack(parentid, name, clientid, total_u, used_u, free_u, empty) VALUES ';

    primero = true;    
    
    for (let data of aggrData.dataRacks) {       
        if (primero) {
            primero = false;
        } else {
            insertSql += ', ';
        }
        insertSql += `((SELECT id from bjumper.row WHERE name='${data.row}'),'${data.label}', '${data.uuid}',
        '${data.TOTAL_USPACE}', '${data.USED_USPACE}', '${data.AVAILABLE_USPACE}','${data.empty}' )`;
    }
    

    await postgresClient.query(insertSql + ';')
}

module.exports = { insertBBDDITA }
 