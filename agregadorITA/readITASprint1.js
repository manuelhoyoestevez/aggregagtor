const {Client} = require('pg');
const {pgITA} = require('../config');
const { produce } = require('../publishRabbit.js')

const client = new Client(pgITA);

(async ()=> {
    await client.connect((err) => {
        console.log('connect err:', err);
    });
    
    produce(JSON.stringify({
        type: 'AgregadorITA',
        data: dataTypes        
    }))    
   
})()
