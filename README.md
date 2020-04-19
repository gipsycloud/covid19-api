# COVID19-India API

A volunteer-driven database for COVID-19 stats & patient tracing in Myanmar.

## API

| Data                                                  | URL                                                   |
| ----------------------------------------------------- | ----------------------------------------------------- |
| National time series, statewise stats and test counts | https://raw.githubusercontent.com/thantthet/covid19-api/master/data.json                |
| State-district-wise                                   | https://raw.githubusercontent.com/thantthet/covid19-api/master/state_district_wise.json |
| State-district-wise V2                                | https://raw.githubusercontent.com/thantthet/covid19-api/master/v2/state_district_wise.json |
| Raw data                                              | https://raw.githubusercontent.com/thantthet/covid19-api/master/raw_data.json            |
| States Daily changes                                  | https://raw.githubusercontent.com/thantthet/covid19-api/master/states_daily.json        |


## Projects Using This API

- [INDIA COVID-19 TRACKER](https://covid19.ttkz.me/) (Dashboard)

## Quick Links

- [Source Database](http://covidmyanmar.com)

## How this works

- This repo is merely a bridge to the main source of Data ([Google Sheets](http://bit.ly/2019ncovmmdata))
- Volunteers collect data from trusted sources and update the sheet
- This repo periodically fetches relevant data from the Sheet and create/update static json/csv.


## Contributing

- Contributions to new data formats are welcome
- Please raise an issue before submitting a PR
- Report issues with Place names in the [Main Site repo](https://github.com/covid19india/covid19india-react/issues)
- DO NOT change json or csv directly. They get replaced automatically
