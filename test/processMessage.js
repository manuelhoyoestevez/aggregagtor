const { assert } = require('chai');
const { processMessage } = require('../consumer/processMessage');
const { deleteAll } = require('../consumer/dbOperations');


const clone = obj => JSON.parse(JSON.stringify(obj));

describe('Process message', () => {
    it('"processMessage" must work OK', async () => {
        // Borrar todos los datos de test
        await deleteAll(4);

        let result;

        // Primeros
        result = await processMessage({
            originSystem: 'Test',
            dataItems: [
                { idItem: 'I', itemClass: 'Rack', name: 'I 02', 'parentIdItem': 'F', measures: [] },
                { idItem: 'C', itemClass: 'Room', name: 'Room C', parentIdItem: 'A', measures: [] },
                { idItem: 'D', itemClass: 'Row', name: 'SC1-AGP-D', parentIdItem: 'B', measures: [] },
                { idItem: 'A', itemClass: 'Datacenter', name: 'Bjumper Lab', parentIdItem: null, measures: [] },
                { idItem: 'H', itemClass: 'Rack', name: 'H 01', parentIdItem: 'E', measures: [] },
                { idItem: 'E', itemClass: 'Row', name: 'SC2-AGP-E', parentIdItem: 'B', measures: [] },
                { idItem: 'B', itemClass: 'Room', name: 'Room B', parentIdItem: 'A', measures: [] },
                { idItem: 'F', itemClass: 'Row', name: 'SC3-AGP-F', parentIdItem: 'C', measures: [] },
                { idItem: 'G', itemClass: 'Rack', name: 'G 99', parentIdItem: 'D', measures: [] },
                { idItem: 'J', itemClass: 'Rack', name: 'J 03', parentIdItem: 'F', measures: [] }
            ]
        });

        assert.equal(result.originSystemId, '4');
        assert.equal(result.itemIndex['A'].action, 'create');
        assert.equal(result.itemIndex['B'].action, 'create');
        assert.equal(result.itemIndex['C'].action, 'create');
        assert.equal(result.itemIndex['D'].action, 'create');
        assert.equal(result.itemIndex['E'].action, 'create');
        assert.equal(result.itemIndex['F'].action, 'create');
        assert.equal(result.itemIndex['G'].action, 'create');
        assert.equal(result.itemIndex['H'].action, 'create');
        assert.equal(result.itemIndex['I'].action, 'create');
        assert.equal(result.itemIndex['J'].action, 'create');

        result = await processMessage({
            originSystem: 'Test',
            dataItems: [
                { idItem: 'I', itemClass: 'Rack', name: 'I 02', 'parentIdItem': 'F', measures: [] },
                { idItem: 'C', itemClass: 'Room', name: 'Room C', parentIdItem: 'A', measures: [] },
                { idItem: 'D', itemClass: 'Row', name: 'SC1-AGP-D', parentIdItem: 'B', measures: [] },
                { idItem: 'A', itemClass: 'Datacenter', name: 'Bjumper Lab', parentIdItem: null, measures: [] },
                { idItem: 'H', itemClass: 'Rack', name: 'H 01A', parentIdItem: 'E', measures: [] },
                { idItem: 'E', itemClass: 'Row', name: 'SC2-AGP-E', parentIdItem: 'B', measures: [] },
                { idItem: 'B', itemClass: 'Room', name: 'Room B', parentIdItem: 'A', measures: [] },
                { idItem: 'F', itemClass: 'Row', name: 'SC3-AGP-F', parentIdItem: 'C', measures: [] },
                { idItem: 'J', itemClass: 'Rack', name: 'J 03', parentIdItem: 'F', measures: [] },
                { idItem: 'K', itemClass: 'Rack', name: 'K 99', parentIdItem: 'D', measures: [] }
            ]
        });

        assert.equal(result.originSystemId, '4');
        assert.equal(result.itemIndex['A'].action, 'none');
        assert.equal(result.itemIndex['B'].action, 'none');
        assert.equal(result.itemIndex['C'].action, 'none');
        assert.equal(result.itemIndex['D'].action, 'none');
        assert.equal(result.itemIndex['E'].action, 'none');
        assert.equal(result.itemIndex['F'].action, 'none');
        assert.equal(result.itemIndex['G'].action, 'deactivate');
        assert.equal(result.itemIndex['H'].action, 'update');
        assert.equal(result.itemIndex['I'].action, 'none');
        assert.equal(result.itemIndex['J'].action, 'none');
        assert.equal(result.itemIndex['K'].action, 'create');
    });
});
