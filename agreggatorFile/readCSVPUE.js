const csv = require("csv-parser");
const fs = require("fs");
const moment = require("moment");
const { produce } = require("../publishRabbit.js");

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

const generateId = (csvRow) => {
  // Devuelve el ID normalizado, en funcion de su classItem y su name
  return replaceAll("datacenter_" + csvRow["DC"], " ", "_").toUpperCase();
};

const translateDate = (date) => {
  // Devuelve el date del excel transformada a ISO

  //var momentDate = moment('2015-01-16 22:15:00', 'YYYY-MM-DD HH:mm:ss');

  return moment(date + " 03:00", "MM/DD/YYYY HH:mm").toISOString();
};

(async () => {
  //let writeCSV;
  const dcs = [];

  try {
    fs.createReadStream("./file/PUE.csv")
      .pipe(csv({}))
      .on("data", (data) => dcs.push(data))
      .on("end", () => {
        //console.log("dcs", dcs);

        const index = {};

        for (const csvRow of dcs) {
          const dc = csvRow["DC"]; //dc = dcA, dcB...

          if (index[dc] === undefined) {
            index[dc] = {
              idItem: generateId(csvRow),
              itemClass: "Datacenter",
              name: dc,
              parentIdItem: null,
              parentName: null,
              measures: [],
            };
          }

          index[dc].measures.push({
            name: "PUE",
            value: csvRow["PUE"],
            timestamp: translateDate(csvRow["Timestamp"]),
          });
        }

        const toSend = {
          originSystem: "File",
          dataItems: Object.values(index),
        };

        console.log("toSend", toSend);
        console.log("toSend", toSend.dataItems[1].measures);

        produce(JSON.stringify(toSend));
      });
  } catch (e) {
    console.error("Error Occurred", e);
    throw new Error(e);
  }
})();
