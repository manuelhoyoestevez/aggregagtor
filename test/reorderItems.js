const { assert, expect } = require('chai');
const originalItemIndex = require('./data/itemIndex01.json');
const { generateTree, checkItems, checkPath, reorderItems, symplifyItemTree } = require('../consumer/reorderItems');

const clone = obj => JSON.parse(JSON.stringify(obj));

describe('Item index operations', () => {

    it('"checkItems" must work OK', () => {
        const verified = checkItems(clone(originalItemIndex));
        const result = verified.join('');

        expect(verified).to.have.lengthOf(12);
        expect(result).to.be.a('string');
        expect(result).to.equal('AIFCDBHEGJYX');

        assert.lengthOf(verified, 12);
        assert.equal(result, 'AIFCDBHEGJYX');
        assert.typeOf(result, 'string');
    });

    it('"checkItems" must throw error: Item with invalid parent origin ID', () => {
        const itemIndex = clone(originalItemIndex);
        itemIndex['C']['originParentId'] = 'W'; // Error
        try {
            checkItems(itemIndex);
        } catch (e) {
            assert.equal(e.toString(), "Error: Item with origin ID 'C' has invalid parent origin ID: 'W'");
            return;
        }

        assert.fail("Must throw Error: Item with invalid parent origin ID");
    });

    it('"checkItems" must throw error: Cycle detected', () => {
        const itemIndex = clone(originalItemIndex);
        itemIndex['A']['originParentId'] = 'X'; // Error
        try {
            checkItems(itemIndex);
        } catch (e) {
            assert.equal(e.toString(), "Error: Cycle detected: 'I', 'F', 'C', 'A', 'X', 'E', 'B'");
            return;
        }

        assert.fail("Must throw Error: Cycle detected");
    });

    it('"generateTree" must generate tree', () => {
        const itemIndex = clone(originalItemIndex);
        const items = Object.values(itemIndex);
        const itemTree = generateTree(items);
        const simplifiedTree = JSON.stringify(symplifyItemTree(itemTree));
        assert.equal(simplifiedTree, '{"A":{"C":{"F":{"I":{},"J":{}}},"B":{"D":{"G":{}},"E":{"H":{},"X":{}}},"Y":{}}}');
    });

    it('"generateTree" must group the items', () => {
        const itemIndex = clone(originalItemIndex);
        const items = Object.values(itemIndex);
        const itemTree = generateTree(items);
        const groups = reorderItems(itemTree);
        const reducedGroups = JSON.stringify(groups.map(group => group.map(({ originId }) => originId)));
        assert.equal(reducedGroups, '[["A"],["C","B","Y"],["F","D","E"],["I","J","G","H","X"]]');
    });

    it('"checkPath" must throw error unknown item', () => {
        try {
            const itemIndex = clone(originalItemIndex);
            checkPath(itemIndex, 'W', [], []);
        } catch (e) {
            assert.equal(e.toString(), "Error: Unknown item with ID: 'W'");
            return;
        }

        assert.fail("Must throw Error:  Unknown item");
    });
});
