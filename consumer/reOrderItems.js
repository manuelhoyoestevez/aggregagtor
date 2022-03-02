const generateTree = items => {
    const roots = [];
    const parentIndex = {};

    for (const item of items) {
        const originParentId = item.originParentId;

        if (originParentId === null) {
            roots.push(item);
        }

        if (parentIndex[originParentId] === undefined) {
            parentIndex[originParentId] = [];
        }

        parentIndex[originParentId].push(item);
    }

    for (const item of items) {
        item.children = parentIndex[item.originId] || [];
    }

    return roots;
};

const checkPath = (itemIndex, id, path, verified) => {
    if (path.indexOf(id) >= 0) {
        throw new Error('Cycle detected: ' + path.map(e => `'${e}'`).join(', '));
    }

    if (verified.indexOf(id) >= 0) {
        for(const i of path) {
            verified.push(i);
        }
        return verified;
    }

    const item = itemIndex[id];

    if (item === undefined) {
        throw new Error(`Unknown item with ID: '${id}'`);
    }

    path.push(id);

    return checkPath(itemIndex, item.originParentId, path, verified);
};

const checkItems = itemIndex => {
    const verified = [];

    // Se comprueba que los padres son válidos y se actualizan los ids internos de los padres cuando se conocen
    for(const item of Object.values(itemIndex)) {

        const parent = item.originParentId === null ? null : itemIndex[item.originParentId];
        if (parent === undefined) {
            throw new Error(`Item with origin ID '${item.originId}' has invalid parent origin ID: '${item.originParentId}'`);
        }

        if (parent === null) {
            item.parentId = null;
            verified.push(item.originId);
            continue;
        }
    }

    // Se comprueban los distintos caminos
    for(const item of Object.values(itemIndex)) {
        checkPath(itemIndex, item.originId, [], verified);
    }

    return verified;
};

const reorderItems = itemTree => {
    let els = itemTree;
    const groups = [];

    while (els.length > 0) {
        groups.push(els);

        els = els
            .map(item => item.children)
            .reduce((previousChildren, currentChildren) => previousChildren.concat(currentChildren), []);
    }

    return groups;
};

const symplifyItemTree = itemTree => itemTree.reduce((p, { originId, children }) => ({ ...p, [originId]: symplifyItemTree(children) }), {});

module.exports = { generateTree, checkItems, checkPath, reorderItems, symplifyItemTree };
