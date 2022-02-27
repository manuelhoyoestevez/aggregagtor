const { Client } = require("pg");
const { pgITA } = require("../config");
const { produce } = require('../publishRabbit.js');

const client = new Client(pgITA);

const timestamp = new Date().toISOString();

(async () => {
  await client.connect((err) => {
    console.log("connect err:", err);
  });

  let dataItems = [];

  try {
    const query = `SELECT uuid, identifiable_type, label, parent_uuid 
        FROM identifiable 
        WHERE label IN('SC1', 'PL1')`;

    let res = await client.query(query);

    dataItems = dataItems.concat(
      res.rows.map((dc) => ({
        idItem: dc.uuid,
        itemClass: "Datacenter",
        name: dc.label,
        parentIdItem: dc.parent_uuid,
        parentName: null,
        measures: [],
      }))
    );
  } catch (e) {
    console.error("Error Occurred", e);
    throw new Error(e);
  }

  try {
    const query = `WITH RECURSIVE subordinates AS (
            SELECT
				uuid, identifiable_type, label, parent_uuid, uuid as p_uuid, label AS p_dc
            FROM
                public.identifiable
            WHERE
                uuid IN('673cb62a-1e5d-40f0-91a1-3e788799cbff', 'a1d64202-194a-4b44-820e-0524bfec20e1')
            UNION
                SELECT
                    I.uuid, I.identifiable_type, I.label, I.parent_uuid,
					S.p_uuid, S.p_dc				
                FROM public.identifiable I INNER JOIN subordinates S ON I.parent_uuid = S.uuid
        )
        SELECT identifiable_type, label, uuid ,p_uuid, p_dc
        FROM subordinates
		WHERE label IN('P2-DC','SC1-ACG1','SC1-DC') `;

    let res = await client.query(query);

    dataItems = dataItems.concat(
      res.rows.map((room) => ({
        idItem: room.uuid,
        itemClass: "Room",
        name: room.label,
        parentIdItem: room.p_uuid,
        parentName: null,
        measures: [],
      }))
    );
  } catch (e) {
    console.error("Error Occurred", e);
    throw new Error(e);
  }

  try {
    const query = `SELECT uuid, identifiable_type, label, room_id as parent_uuid 
            FROM identifiable 
            WHERE identifiable_type = 'Row' AND room_id IN ('1b766edc-2667-44b1-8bb9-41f572757bff','9f20756c-1231-4aa0-8e8b-9d2ad72ef6dd','5ad8b855-a44f-48fe-8ba1-83a1c3464235') `;

    let res = await client.query(query);

    dataItems = dataItems.concat(
      res.rows.map((row) => ({
        idItem: row.uuid,
        itemClass: "Row",
        name: row.label,
        parentIdItem: row.parent_uuid,
        parentName: null,
        measures: [],
      }))
    );

    
  } catch (e) {
    console.error("Error Occurred", e);
    throw new Error(e);
  }

  
    try {
        const infoUs = ['AVAILABLE_USPACE','USED_USPACE','TOTAL_USPACE', 'RESERVED_USPACE']

        const query = `WITH RECURSIVE subordinates AS (
            SELECT
                uuid, identifiable_type, label, parent_uuid, uuid AS id_row, label AS row
            FROM
                public.identifiable
            WHERE
                parent_uuid IN('1b766edc-2667-44b1-8bb9-41f572757bff', '9f20756c-1231-4aa0-8e8b-9d2ad72ef6dd','5ad8b855-a44f-48fe-8ba1-83a1c3464235')
	            AND identifiable_type = 'Row'
            UNION
                SELECT
                    I.uuid, I.identifiable_type, I.label, I.parent_uuid,
                    S.id_row, S.row					
                FROM public.identifiable I INNER JOIN subordinates S ON I.row_id = S.uuid
        )
        SELECT label, identifiable_type, row, uuid, id_row
        FROM subordinates
        WHERE identifiable_type = 'Rack' AND label SIMILAR TO '(P2%|SC1%)'
		ORDER BY label, row `;

        let res = await client.query(query)
        //rack = rack.concat(res.rows)

        const racks = res.rows.map((rack) => ({
            idItem: rack.uuid,
            itemClass: "Rack",
            name: rack.label,
            parentIdItem: rack.id_row,
            parentName: null,
            measures: [],
        }));

        let rackIds = [];
        const rackIndex = {};

        for(const rack of racks) {
            rackIds.push(rack.idItem);
            rackIndex[rack.idItem] = rack;
        }

        const rackMeasureQuery = `SELECT uuid, label, series_type, integer_value, double_value 
        FROM identifiable I 
            INNER JOIN kpi_history_point_latest KPI_h ON I.uuid = KPI_h.identifiable_uuid 
            INNER JOIN kpi_metric KPI_m ON KPI_m.kpi_history_point_id = KPI_h.history_point_uuid
        WHERE uuid IN (${rackIds.map(id => `'${id}'` ).join(',')}) 
        AND series_type IN ('AVAILABLE_USPACE','USED_USPACE','TOTAL_USPACE')`;

        

        const measuresUs = await client.query(rackMeasureQuery);

        const measuMaster = {
            AVAILABLE_USPACE: 'Free_U',
            TOTAL_USPACE: 'Total_U',
            USED_USPACE: 'Used_U'
        };

        for(const measureU of measuresUs.rows) {
            rackIndex[measureU.uuid].measures.push({
                name: measuMaster[measureU.series_type],
                value: measureU.integer_value,
                timestamp: timestamp
            });
        }

        dataItems = dataItems.concat(racks);


        const toSend = {
            originSystem: "ITA",
            dataItems: dataItems,
          };
        produce(JSON.stringify(toSend));

/*        dataItems = dataItems.concat(
            res.rows.map((rack) => ({
              idItem: rack.uuid,
              itemClass: "rack",
              name: rack.label,
              parentIdItem: rack.id_row,
              parentName: null,
              measures: [],
            }))
          );*/
        /*
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
        }))  */           
        
    } catch (e){
        console.error('Error Occurred', e)
        throw new Error(e)
    }   
    
   

  await client.end();
})();
