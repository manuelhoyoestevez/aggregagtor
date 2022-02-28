const generateTree = items => {
    const roots = [];
    const parentIndex = {};

    for (const item of items) {
        const parentId = item.idParentinOrigin;

        if (parentId === null || item.idParent !== null) {
            roots.push(item);
        }

        if (parentIndex[parentId] === undefined) {
            parentIndex[parentId] = [];
        }

        parentIndex[parentId].push(item);
    }

    for (const item of items) {
        item.children = parentIndex[item.idIteminOrigin] || [];
    }

    return roots;
};

const reOrderItems = items => {
    const groups = [];
    let visited = [];
    let els = generateTree(items);

    while(els.length > 0) {
        groups.push(els);
        const itemsIds = els.map(item => item.idIteminOrigin);
        const intersection = itemsIds.filter(id => visited.includes(id));

        if (intersection.length > 0) {
            throw new Error('Cycle detected for item IDs: ' + intersection.map(id => `'${id}'`).join(', '));
        }

        visited = visited
            .concat(itemsIds);

        els = els
            .map(item => item.children)
            .reduce((previousChildren, currentChildren) => previousChildren.concat(currentChildren), []);
    }

    return groups;
};

module.exports = { reOrderItems };
