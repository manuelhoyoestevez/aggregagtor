
require('dotenv').config()
const config = require('./config.js')
const amqplib = require('amqplib')


const ampq_url = config.rabbitURL
console.log ("config",config)
console.log ("ampq",ampq_url)
async function produce(msg) {

    const conn = await amqplib.connect(ampq_url, "heartbeat=60")
    const ch = await conn.createChannel()
    const exch = 'exch.agregador'
    const rkey = 'agregador'
    const q = 'queue.agregador'
    const exchType= 'direct'

    await ch.assertExchange(exch, exchType, {durable: true}).catch(console.error);
    await ch.assertQueue(q, {durable: true})
    await ch.bindQueue(q, exch, rkey)

    await ch.publish(exch, rkey, Buffer.from(msg))

    setTimeout(() => {
        ch.close()
        conn.close()
    }, 500)

}

module.exports = {produce}