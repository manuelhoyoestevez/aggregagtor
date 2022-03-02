const { assert } = require("chai");
const moment = require("moment-timezone");

const date   = '05/17/2021 23:00';
const format = 'MM/DD/YYYY HH:mm';

describe('moment with timezone tests', () => {
    it('"17/05/2021, 11:00:00 pm" in Madrid is "17/05/2021, 04:00:00 pm" in Lima (ISO: 2021-05-17T21:00:00.000Z)', () => {
        // Leer una fecha local en Madrid
        const dateMadrid = moment.tz(date, format, "Europe/Madrid");
        assert.equal(dateMadrid.format('DD/MM/YYYY, hh:mm:ss a'), '17/05/2021, 11:00:00 pm');

        // Conocer su ISO
        assert.equal(dateMadrid.toISOString(), '2021-05-17T21:00:00.000Z');
        
        // Traducirla a la hora local de Lima
        dateMadrid.tz("America/Lima");
        assert.equal(dateMadrid.format('DD/MM/YYYY, hh:mm:ss a'), '17/05/2021, 04:00:00 pm');
    });

    it('"17/05/2021, 11:00:00 pm" in Lima is "18/05/2021, 06:00:00 am" in Madrid (ISO: 2021-05-18T04:00:00.000Z)', () => {
        // Leer una fecha local en Lima
        const dateLima = moment.tz(date, format, "America/Lima");
        assert.equal(dateLima.format('DD/MM/YYYY, hh:mm:ss a'), '17/05/2021, 11:00:00 pm');
        
        // Conocer su ISO
        assert.equal(dateLima.toISOString(), '2021-05-18T04:00:00.000Z');
        
        // Traducirla a la hora local de Madrid
        dateLima.tz("Europe/Madrid");
        assert.equal(dateLima.format('DD/MM/YYYY, hh:mm:ss a'), '18/05/2021, 06:00:00 am');
    });
});
