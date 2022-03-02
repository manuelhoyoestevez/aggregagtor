const { assert } = require('chai');
const { 
    getOriginSystemId,
    getItemClasses,
    getMeasuresIds,
    getSystemItems,
    insertItems,
    updateItems,
    insertMeasures,
    deactivateItems 
} = require('../consumer/dbOperations');

describe('DB operations features', () => {
    it('"getOriginSystemId" must resolve "ITA" id', async () => {
        const itaId = await getOriginSystemId('ITA');
        assert.equal(itaId, 2);
    });

    it('"getOriginSystemId" must throw error: Invalid Origin System', async () => {
        try {
            await getOriginSystemId('UNKNOWN');
        } catch(e) {
            assert.equal(e.toString(), 'Error: Invalid Origin System: UNKNOWN (0 rows fetched)');
            return;
        }
        assert.fail("Must throw Error: Invalid Origin System");
    });

    it('"getItemClasses" must resolve item classes', async () => {
        const itemClasses = JSON.stringify(await getItemClasses(['Rack', 'Row']));
        assert.equal(itemClasses, '{"Rack":"4","Row":"3"}');
    });

    it('"getItemClasses" must throw error: Unknown item class', async () => {
        try {
            await getItemClasses(['Rack', 'Row', 'UNKNOWN']);
        } catch(e) {
            assert.equal(e.toString(), 'Error: Unknown item class: UNKNOWN');
            return;
        }
        assert.fail("Must throw Error: Unknown item class");
    });

});