const csv = require("csv-parser");
const fs = require("fs");
const { produce } = require("../publishRabbit.js");

(async () => {
  //let writeCSV;
  const dcs = [];
  try {
    fs.createReadStream("./file/PUEv2.csv")
      .pipe(csv({}))
      .on("data", (data) => dcs.push(data))
      .on("end", () => {
        console.log("dcs", dcs);
        for (let dc of dcs) {
          produce(
            JSON.stringify({
              type: "AgreggatorFile",
              dataDC: dc,
              dataRooms: "hay un room",
            })
          );
        }
      });
  } catch (e) {
    console.error("Error Occurred", e);
    throw new Error(e);
  }
})();
