require('dotenv').config();

const config = {
    auth: {
        username: process.env.API_USERNAME_ITA,
        password: process.env.API_PASSWORD_ITA,
    },
    rabbitURL: process.env.RABBIT_URL,
    postgreConnection: {
        user: process.env.PG_USER,
        host: process.env.HOST_PG,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
    }
};

module.exports = config;
