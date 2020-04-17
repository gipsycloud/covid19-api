const { task, fetchData, writeData } = require("./lib");
const c = require("./lib/constants");


(async function main() {
  console.log("Running task on start...");

  await task({
    sheet: c.SHEET,
    tabs: { states_daily: c.SHEET_DATE_WISE_DELTA },
    file: c.FILE_DATE_WISE_DELTA
  });
  
  await task({
    sheet: c.SHEET,
    tabs: {
      cases_time_series: c.SHEET_CASES_TIMESERIES,
      statewise: c.SHEET_STATE_WISE,
    },
    file: c.FILE_DATA
  });

  await task({
    sheet: c.SHEET,
    tabs: {
      raw_data: c.SHEET_RAW_DATA
    },
    file: c.FILE_RAW_DATA
  });
  

  console.log("End of sheet-to-json_generic");
})();
