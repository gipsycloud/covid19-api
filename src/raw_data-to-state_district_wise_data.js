const fs = require('fs');
const moment = require("moment");
const { DIR } = require("../lib/constants");
const rawData = require('../tmp/raw_data');

console.log('Starting district wise data processing');
try {
  const StateDistrictWiseData = rawData.raw_data.reduce((acc, row) => {
    const today = moment().utcOffset("+06:30").format("DD/MM/YYYY");
    const announcedToday = today === row.dateannounced;
    const dischargedDeceasedToday = today === row.dischargeddeceaseddate;
    const recoveredToday = today === row.recovereddate;
    let stateName = row.detectedstate;
      if(!stateName) {
        return acc;
      }
    if(!acc[stateName]) {
      acc[stateName] = {
        districtData: {},
        statecode: row.statecode,
      };
    }
    let districtName = row.detecteddistrict;
      if(!districtName) {
        districtName = 'Unknown';
      }
    if(!acc[stateName].districtData[districtName]) {
      
      acc[stateName].districtData[districtName] = {
        active: 0,
        confirmed: 0,
        deceased: 0,
        recovered: 0,
        delta: {
          confirmed: 0,
          deceased: 0,
          recovered: 0,
        }
      };
    }
    const currentDistrict = acc[stateName].districtData[districtName];
  
    currentDistrict.confirmed++;
    if (announcedToday) {
      currentDistrict.delta.confirmed++;
    }
    if(row.currentstatus === 'Hospitalized') {
      currentDistrict.active++;
    } else if(row.currentstatus === 'Deceased') {
      currentDistrict.deceased++;
      if (dischargedDeceasedToday) {
        currentDistrict.delta.deceased++;
      }
    } else if(row.currentstatus === 'Recovered') {
      currentDistrict.recovered++;
      if (recoveredToday) {
        currentDistrict.delta.recovered++;
      }
    }

    return acc;
  
  }, {});

  let stateDistrictWiseDataV2 = Object.keys(StateDistrictWiseData).map(state => {
    let districtData = StateDistrictWiseData[state].districtData;
    return {
      state,
      statecode: StateDistrictWiseData[state].statecode,
      districtData: Object.keys(districtData).map(district => {
        return { district, ...districtData[district] };
      })
    }
  });

  fs.writeFileSync(DIR + 'state_district_wise.json', JSON.stringify(StateDistrictWiseData, null, 2));
  fs.writeFileSync(DIR + 'v2/state_district_wise.json', JSON.stringify(stateDistrictWiseDataV2, null, 2));
  console.log('Starting district wise data processing ...done');
} catch(err) {
  console.log('Error processing district wise data', err);
}

