const { task } = require("../lib");
const c = require("../lib/constants");


(async function main() {
  console.log("Running task on start...");

  await task({
    sheet: c.SHEET,
    tabs: {
      raw_data: c.SHEET_RAW_DATA
    },
    file: c.FILE_RAW_DATA
  });

  console.log("End of sheet-to-json_generic");
})();
