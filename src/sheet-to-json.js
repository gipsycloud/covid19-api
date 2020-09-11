const assert = require('assert');
const moment = require("moment-timezone");
const rawData = require('../tmp/raw_data');
const { writeData } = require("../lib");
const { FILE_DATA, FILE_DATE_WISE_DELTA } = require("../lib/constants");

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

moment.tz.setDefault('Asia/Rangoon')

const statecodes = ['MM-01','MM-02','MM-03','MM-04','MM-05','MM-06','MM-07','MM-11','MM-12','MM-13','MM-14','MM-15','MM-16','MM-17','MM-18'];
const beginning = moment("2020-03-22T00:00:00");

function forEachDate(callback) {
  const todayDate = moment();
  for (i = 0; i <= todayDate.diff(beginning, 'days'); i++) {
    const currentDate = moment(beginning).add(i, 'day');
    const stringDate = currentDate.format("DD/MM/YYYY");
    callback(stringDate, currentDate);
  }
}

function Counter(accumulator, currentValue) {
  return accumulator + Number(currentValue.quantity)
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
          count = raw_data.filter((value) => value.dateannounced === currentDate && value.statecode === statecode).reduce(Counter, 0);
        } else if (status == 'recovered') {
          // count of filtered data by DATE, STATUS, STATECODE
          count = raw_data.filter((value) => value.dischargeddeceaseddate === currentDate && value.status === status && value.statecode === statecode).reduce(Counter, 0);
        } else {
          // count of filtered data by DATE, STATUS, STATECODE
          count = raw_data.filter((value) => value.dischargeddeceaseddate === currentDate && value.status === status && value.statecode === statecode).reduce(Counter, 0);
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

  const allCases   = raw_data
  const allRecoveries = allCases.filter(value => value.currentstatus === 'Recovered')
  const allDeaths  = allCases.filter(value => value.currentstatus === 'Deceased')
  const allActives = allCases.filter(value => value.currentstatus === 'Hospitalized')

  forEachDate((stringdate, momentdate) => {
    const currentDate = momentdate.unix()

    const dailyConfirmed = allCases.filter((value) => value.dateannounced == stringdate).reduce(Counter, 0);
    const totalConfirmed = allCases.filter((value) => moment(value.dateannounced, 'DD/MM/YYYY').unix() <= currentDate).reduce(Counter, 0);

    const dailyRecovered = allRecoveries.filter((value) => value.dischargeddeceaseddate == stringdate).reduce(Counter, 0);
    const totalRecovered = allRecoveries.filter((value) => moment(value.dischargeddeceaseddate, 'DD/MM/YYYY').unix() <= currentDate).reduce(Counter, 0);

    const dailyDeceased = allDeaths.filter((value) => value.dischargeddeceaseddate == stringdate).reduce(Counter, 0);
    const totalDeceased = allDeaths.filter((value) => moment(value.dischargeddeceaseddate, 'DD/MM/YYYY').unix() <= currentDate).reduce(Counter, 0);

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
  const stringdatetoday = moment().format('DD/MM/YYYY');
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

  // For each state
  statecodes.forEach((statecode) => {
    const confirmed = allCases.filter((value) => value.statecode === statecode).reduce(Counter, 0);
    const deaths    = allDeaths.filter((value) => value.statecode === statecode).reduce(Counter, 0);
    const recovered = allRecoveries.filter((value) => value.statecode === statecode).reduce(Counter, 0);
    const active    = allActives.filter((value) => value.statecode === statecode).reduce(Counter, 0);

    const deltaConfirmed = allCases.filter((value) => value.statecode === statecode && value.dateannounced === stringdatetoday).reduce(Counter, 0);
    const deltaDeaths    = allDeaths.filter((value) => value.statecode === statecode && value.dischargeddeceaseddate === stringdatetoday).reduce(Counter, 0);
    const deltaRecovered = allRecoveries.filter((value) => value.statecode === statecode && value.dischargeddeceaseddate === stringdatetoday).reduce(Counter, 0);

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

  // Total
  const confirmed = allCases.reduce(Counter, 0);
  const deaths    = allDeaths.reduce(Counter, 0);
  const recovered = allRecoveries.reduce(Counter, 0);
  const active    = allActives.reduce(Counter, 0);

  const deltaConfirmed = allCases.filter((value) => value.dateannounced === stringdatetoday).reduce(Counter, 0);
  const deltaDeaths    = allDeaths.filter((value) => value.dischargeddeceaseddate === stringdatetoday).reduce(Counter, 0);
  const deltaRecovered = allRecoveries.filter((value) => value.recovereddate === stringdatetoday).reduce(Counter, 0);
  
  // total entry has to be first entry
  statewise.unshift({
    state: 'Total',
    statecode: 'TT',
    confirmed: confirmed,
    deaths: deaths,
    recovered: recovered,
    active: active,
    deltaconfirmed: deltaConfirmed,
    deltadeaths: deltaDeaths,
    deltarecovered: deltaRecovered
  });

  const lastTimeseries = timeseries[timeseries.length - 1]
  assert.equal(confirmed, lastTimeseries.totalconfirmed, "Unequal count of confirmed cases")

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
