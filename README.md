# COVID19-Myanmar API

A volunteer-driven database for COVID-19 stats & patient tracing in Myanmar.

## API

| Data                                                  | URL                                                   |
| ----------------------------------------------------- | ----------------------------------------------------- |
| National time series, statewise stats and test counts | https://thantthet.github.io/covid19-api/data.json                |
| State-district-wise                                   | https://thantthet.github.io/covid19-api/state_district_wise.json |
| State-district-wise V2                                | https://thantthet.github.io/covid19-apir/v2/state_district_wise.json |
| Raw data                                              | https://thantthet.github.io/covid19-api/raw_data.json            |
| States Daily changes                                  | https://thantthet.github.io/covid19-api/states_daily.json        |


## Projects Using This API

- [MYANMAR COVID-19 TRACKER](https://covid19.ttkz.me/) (Dashboard)

## Quick Links

- [Source Database](http://covidmyanmar.com)

## How this works

- This repo is merely a bridge to the ([Google Sheets](https://docs.google.com/spreadsheets/d/e/2PACX-1vQtsZ5wa7wVHyyDBNtRKB--kFiCXPAlr_ka7X-DFY5yV4KR-a2pFne7HQKEkNBecqzczu8AfkqQ5jdR/pubhtml) derived from [main source](http://bit.ly/2019ncovmmdata))
- Volunteers collect data from trusted sources and update the sheet
- This repo periodically fetches relevant data from the Sheet and create/update static json/csv.


## Contributing

- Contributions to new data formats are welcome
- Please raise an issue before submitting a PR
- Report issues with Place names in the [Main Site repo](https://github.com/covid19india/covid19india-react/issues)
- DO NOT change json or csv directly. They get replaced automatically
