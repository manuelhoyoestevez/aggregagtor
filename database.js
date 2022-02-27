const { Client } = require('pg');
const { postgreConnection } = require('./config');

const postgresClient = new Client(postgreConnection);

module.exports = postgresClient.connect().then(() => {
    console.log('Postgress loaded by Manolo!');
    return postgresClient;
});