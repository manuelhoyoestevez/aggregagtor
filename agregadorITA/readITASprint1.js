const {Client} = require('pg');
const {pgITA} = require('../config');
const { produce } = require('../publishRabbit.js')

const client = new Client(pgITA);

(async ()=> {
    await client.connect((err) => {
        console.log('connect err:', err);
    });
    
    let dc= []
    let room = [] 
    let row = []
    let rack = []

    try {
        const query = `SELECT uuid, identifiable_type, label, parent_uuid 
        FROM identifiable 
        WHERE label IN('SC1', 'PL1')`;

        let res = await client.query(query)
        dc = dc.concat(res.rows) 

    } catch (e){
        console.error('Error Occurred', e)
        throw new Error(e)
    }    
      
    try {
        const query = `WITH RECURSIVE subordinates AS (
            SELECT
				uuid, identifiable_type, label,	parent_uuid, parent_uuid as p_uuid
            FROM
                public.identifiable
            WHERE
                parent_uuid IN('673cb62a-1e5d-40f0-91a1-3e788799cbff', 'a1d64202-194a-4b44-820e-0524bfec20e1')
            UNION
                SELECT
                    I.uuid, I.identifiable_type, I.label, I.parent_uuid,
					S.p_uuid				
                FROM public.identifiable I INNER JOIN subordinates S ON I.parent_uuid = S.uuid
        )
        SELECT identifiable_type, label, uuid ,p_uuid
        FROM subordinates
		WHERE label IN('P2-DC','SC1-ACG1','SC1-DC') `;

        let res = await client.query(query)
        room = room.concat(res.rows) 

    } catch (e){
        console.error('Error Occurred', e)
        throw new Error(e)
    }     

    try {
        const query = `SELECT uuid, identifiable_type, label, parent_uuid 
            FROM identifiable 
            WHERE parent_uuid IN('1b766edc-2667-44b1-8bb9-41f572757bff','9f20756c-1231-4aa0-8e8b-9d2ad72ef6dd','5ad8b855-a44f-48fe-8ba1-83a1c3464235') 
            AND identifiable_type = 'Row' `;

        let res = await client.query(query)
        row = row.concat(res.rows) 

    } catch (e){
        console.error('Error Occurred', e)
        throw new Error(e)
    }
            
    try {
        const infoUs = ['AVAILABLE_USPACE','USED_USPACE','TOTAL_USPACE', 'RESERVED_USPACE']

        const query = `WITH RECURSIVE subordinates AS (
            SELECT
                uuid, identifiable_type, label, parent_uuid, label as row
            FROM
                public.identifiable
            WHERE
                parent_uuid IN('1b766edc-2667-44b1-8bb9-41f572757bff', '9f20756c-1231-4aa0-8e8b-9d2ad72ef6dd','5ad8b855-a44f-48fe-8ba1-83a1c3464235')
	            AND identifiable_type = 'Row'
            UNION
                SELECT
                    I.uuid, I.identifiable_type, I.label, I.parent_uuid,
                    S.row					
                FROM public.identifiable I INNER JOIN subordinates S ON I.parent_uuid = S.parent_uuid
        )
        SELECT DISTINCT ON (label) label, identifiable_type, row, uuid, parent_uuid
        FROM subordinates
        WHERE identifiable_type = 'Rack' AND label SIMILAR TO '(P2%|SC1%)'`;

        let res = await client.query(query)
        rack = rack.concat(res.rows)         
        
        await Promise.all(rack.map(async (r) =>{
        
            await Promise.all( infoUs.map( async (us)=>{
            const queryUs=` 
            SELECT uuid, label, series_type, integer_value, double_value 
            FROM identifiable I 
                INNER JOIN kpi_history_point_latest KPI_h ON I.uuid = KPI_h.identifiable_uuid 
                INNER JOIN kpi_metric KPI_m ON KPI_m.kpi_history_point_id = KPI_h.history_point_uuid
            WHERE uuid = '${r.uuid}' AND series_type = '${us}' `
        
            let resUs =  await client.query(queryUs)            
           
            r[`${us}`] = resUs.rows[0].integer_value
                      
            }))

            if (r.USED_USPACE === 0) {
                r[`empty`] = 'true'
            } else {
                const queryEmpty = `SELECT P.identifiable_type = 'Layer1NetworkGear' AS layer1
                FROM  identifiable P
                WHERE P.parent_uuid = '${r.uuid}' AND p.rack_mount_chassis_rack_mounting_position= 'FRONT'
                group by layer1
                order by layer1`
                
                let resEmpty =  await client.query(queryEmpty)

                if ( resEmpty.rows[0].layer1===false ) {
                    r[`empty`] = 'false'
                } else {
                    r[`empty`] = 'true'
                }
            }
            r["timestamp"] = new Date()
        }))     
        console.log("rack", rack)           
        
    } catch (e){
        console.error('Error Occurred', e)
        throw new Error(e)
    }   
    
    produce(JSON.stringify({
        type: 'AgregadorITA',
        dataDC: dc,
        dataRooms: room,
        dataRows: row,
        dataRacks: rack
    }))   

    await client.end();

})()
