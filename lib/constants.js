const SHEET = process.env.SHEET_ID;

// Sheet IDs can be obtained here: https://spreadsheets.google.com/feeds/worksheets/<HIDDEN>/private/full
const SHEET_RAW_DATA = "oj12fwe";
const SHEET_STATE_WISE = "ojhjjnk";
const SHEET_CASES_TIMESERIES = "o8w22hn";

const DIR = "./tmp/";

const FILE_DATA = "/data.json";
const FILE_RAW_DATA = "/raw_data.json";
const FILE_DATE_WISE_DELTA = "/states_daily.json";

module.exports = {
    SHEET,
    SHEET_RAW_DATA,
    SHEET_STATE_WISE,
    SHEET_CASES_TIMESERIES,
    DIR,
    FILE_DATA,
    FILE_RAW_DATA,
    FILE_DATE_WISE_DELTA,
};
