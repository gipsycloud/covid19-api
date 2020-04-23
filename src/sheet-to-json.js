const moment = require("moment");
const rawData = require('../tmp/raw_data');
const { writeData } = require("../lib");
const { SHEET, FILE_DATE_WISE_DELTA } = require("../lib/constants");

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

async function task() {
  console.log(`Fetching data from sheets: ${SHEET}...`);
  let {raw_data} = rawData;

  const beginning = moment("2020-03-22T00:00:00+0630");
  const todayDate = moment();

  const statecodes = ['MM-01','MM-02','MM-03','MM-04','MM-05','MM-06','MM-07','MM-11','MM-12','MM-13','MM-14','MM-15','MM-16','MM-17','MM-18'];

  let allEntries = [];
  for (i = 0; i <= todayDate.diff(beginning, 'days'); i++) {
    const currentDate = moment(beginning).add(i, 'day').utcOffset("+0630").format("DD/MM/YYYY");
    ['inpatient', 'recovered', 'deceased'].forEach((status) => {
      const countByStates = statecodes.reduce((value, statecode) => {
        let count = 0;
        if (status == 'inpatient') {
          // count of filtered data by DATE, STATECODE
          count = raw_data.filter((value) => value.dateannounced === currentDate && value.statecode === statecode).length;
        } else {
          // count of filtered data by DATE, STATUS, STATECODE
          count = raw_data.filter((value) => value.dischargeddeceaseddate === currentDate && value.status === status && value.statecode === statecode).length;
        }
        value[statecode.toLowerCase()] = String(count);
        return value;
      }, {});
      const total = Object.keys(countByStates).reduce((t, k) => t + Number(countByStates[k]), 0);
      let entry = {
        date: currentDate,
        tt: total.toString(),
        status: status == 'inpatient' ? 'Confirmed' : status.toProperCase(),
      };
      entry = {...entry, ...countByStates};
      allEntries.push(entry);
    })
  }

  writeData({file: FILE_DATE_WISE_DELTA, data: {states_daily: allEntries}});
  
  console.log("Operation completed!");
}

(async function main() {
  console.log("Running task on start...");
  await task();
  console.log("Created Json File With Updated Contents");
})();
