const moment = require("moment");
const rawData = require('../tmp/raw_data');
const { writeData } = require("../lib");
const { FILE_DATA, FILE_DATE_WISE_DELTA } = require("../lib/constants");

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

const statecodes = ['MM-01','MM-02','MM-03','MM-04','MM-05','MM-06','MM-07','MM-11','MM-12','MM-13','MM-14','MM-15','MM-16','MM-17','MM-18'];
const beginning = moment("2020-03-22T00:00:00+0630");

function forEachDate(callback) {
  const todayDate = moment();
  for (i = 0; i <= todayDate.diff(beginning, 'days'); i++) {
    const currentDate = moment(beginning).add(i, 'day').utcOffset("+0630");
    const stringDate = currentDate.format("DD/MM/YYYY");
    callback(stringDate, currentDate);
  }
}

async function taskDateWiseDeltaFile() {
  console.log(`Generating date wise delta data`);
  let {raw_data} = rawData;

  let allEntries = [];
  forEachDate((currentDate) => {
    ['inpatient', 'recovered', 'deceased'].forEach((status) => {
      const countByStates = statecodes.reduce((value, statecode) => {
        let count = 0;
        if (status == 'inpatient') {
          // count of filtered data by DATE, STATECODE
          count = raw_data.filter((value) => value.dateannounced === currentDate && value.statecode === statecode).length;
        } else if (status == 'recovered') {
          // count of filtered data by DATE, STATUS, STATECODE
          count = raw_data.filter((value) => value.recovereddate === currentDate && value.status === status && value.statecode === statecode).length;
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
  })

  writeData({file: FILE_DATE_WISE_DELTA, data: {states_daily: allEntries}});
  
  console.log("Operation completed!");
}

async function taskDataFile() {
  console.log(`Generating timeseries data`);

  let {raw_data} = rawData;
  
  let timeseries = [];

  forEachDate((stringdate, momentdate) => {
    const dailyConfirmed = raw_data.filter((value) => value.dateannounced === stringdate).length;
    const totalConfirmed = raw_data.filter((value) => moment(value.dateannounced, 'DD/MM/YYYY').isSameOrBefore(momentdate)).length;

    const dailyRecovered = raw_data.filter((value) => value.recovereddate === stringdate && value.currentstatus === 'Recovered').length;
    const totalRecovered = raw_data.filter((value) => moment(value.recovereddate, 'DD/MM/YYYY').isSameOrBefore(momentdate) && value.currentstatus === 'Recovered').length;

    const dailyDeceased = raw_data.filter((value) => value.dischargeddeceaseddate === stringdate && value.currentstatus === 'Deceased').length;
    const totalDeceased = raw_data.filter((value) => moment(value.dischargeddeceaseddate, 'DD/MM/YYYY').isSameOrBefore(momentdate) && value.currentstatus === 'Deceased').length;

    const active = totalConfirmed - totalRecovered - totalDeceased;

    timeseries.push({
      date: stringdate,
      dailyconfirmed: dailyConfirmed,
      totalconfirmed: totalConfirmed,
      dailyrecovered: dailyRecovered,
      totalrecovered: totalRecovered,
      dailydeceased: dailyDeceased,
      totaldeceased: totalDeceased,
      active: active
    });
  });

  let statewise = [];
  const stringdatetoday = moment().utcOffset('+0630').format('DD/MM/YYYY');
  const states = {
    'MM-07': 'Ayeyarwady',
    'MM-02': 'Bago',
    'MM-14': 'Chin',
    'MM-11': 'Kachin',
    'MM-12': 'Kayah',
    'MM-13': 'Kayin',
    'MM-03': 'Magway',
    'MM-04': 'Mandalay',
    'MM-15': 'Mon',
    'MM-16': 'Rakhine',
    'MM-17': 'Shan',
    'MM-01': 'Sagaing',
    'MM-05': 'Tanintharyi',
    'MM-06': 'Yangon',
    'MM-18': 'Nay Pyi Taw'
  };
  statecodes.forEach((statecode) => {
    const confirmed = raw_data.filter((value) => value.statecode === statecode).length;
    const deaths    = raw_data.filter((value) => value.statecode === statecode && value.currentstatus === 'Deceased').length;
    const recovered = raw_data.filter((value) => value.statecode === statecode && value.currentstatus === 'Recovered').length;
    const active    = raw_data.filter((value) => value.statecode === statecode && value.currentstatus === 'Hospitalized').length;

    const deltaConfirmed = raw_data.filter((value) => value.statecode === statecode && value.dateannounced === stringdatetoday).length;
    const deltaDeaths    = raw_data.filter((value) => value.statecode === statecode && value.currentstatus === 'Deceased' && value.dischargeddeceaseddate === stringdatetoday).length;
    const deltaRecovered = raw_data.filter((value) => value.statecode === statecode && value.currentstatus === 'Recovered' && value.recovereddate === stringdatetoday).length;

    statewise.push({
      state: states[statecode],
      statecode: statecode,
      confirmed: confirmed,
      deaths: deaths,
      recovered: recovered,
      active: active,
      deltaconfirmed: deltaConfirmed,
      deltadeaths: deltaDeaths,
      deltarecovered: deltaRecovered
    });
  });

  statewise.unshift(statewise.reduce((prev, current) => {
    prev.statecode = 'TT';
    prev.state = 'Total';
    prev.confirmed = (prev.confirmed || 0) + current.confirmed
    prev.deaths = (prev.deaths || 0) + current.deaths
    prev.recovered = (prev.recovered || 0) + current.recovered
    prev.active = (prev.active || 0) + current.active
    prev.deltaconfirmed = (prev.deltaconfirmed || 0) + current.deltaconfirmed
    prev.deltadeaths = (prev.deltadeaths || 0) + current.deltadeaths
    prev.deltarecovered = (prev.deltarecovered || 0) + current.deltarecovered
    return prev
  }, {}));

  writeData({file: FILE_DATA, data: {
    cases_time_series: timeseries,
    statewise: statewise,
  }});

  console.log("Operation completed!");
}

(async function main() {
  console.log("Running task on start...");
  await taskDateWiseDeltaFile();
  await taskDataFile();
  console.log("Created Json File With Updated Contents");
})();
