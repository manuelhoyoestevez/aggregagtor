require('dotenv').config({ path: '../.env'})

const config = {
    auth: {
        username: process.env.API_USERNAME_ITA,
        password: process.env.API_PASSWORD_ITA,
    },
    rabbitURL: process.env.RABBIT_URL,
    pgITA: {
        user: process.env.PG_USER_ITA,
        host: process.env.HOST_ITA,
        database: process.env.PG_DATABASE_ITA,
        password: process.env.PG_PASSWORD_ITA,
        port: process.env.PG_PORT,
    }
}
module.exports = config