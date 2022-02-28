const csv = require("csv-parser");
const fs = require("fs");
const moment = require("moment");
const { produce } = require("./publishRabbit.js");

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

const generateId = (csvRow) => {
    // Devuelve el ID normalizado, en funcion de su classItem y su name
    return csvRow['Id'] || null;
};

const translateDate = (date) => {
    // Devuelve el date del excel transformada a ISO
    return moment(date + " 03:00", "MM/DD/YYYY HH:mm").toISOString();
};

(async () => {
    const items = [];

    try {
        fs.createReadStream("./csv/pue1.csv")
        .pipe(csv({}))
        .on("data", item => items.push(item))
        .on("end", () => {
            // Indice por ID
            const index = {};

            for (const csvRow of items) {
                const idItem = generateId(csvRow);

                if (index[idItem] === undefined) {
                    index[idItem] = {
                        idItem: idItem,
                        itemClass: null,
                        name: null,
                        parentIdItem: null,
                        measures: [],
                    };
                }

                index[idItem]['itemClass'] = csvRow['Class'];
                index[idItem]['name'] = csvRow['Name'];
                index[idItem]['parentIdItem'] = csvRow['Parent'] || null;
                index[idItem]['measures'].push({
                    name: csvRow['Measure'],
                    value: csvRow['Value'],
                    timestamp: translateDate(csvRow["Timestamp"]),
                });
            }

            const toSend = {
                originSystem: "File",
                dataItems: Object.values(index),
            };

            console.log("Sending: ", toSend);

            produce(JSON.stringify(toSend));
        });
    } catch (e) {
        console.error("Error Occurred", e);
        throw new Error(e);
    }
})();
