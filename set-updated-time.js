const fetch = require('node-fetch');
const moment = require('moment-timezone');
const data = require('./data');
const { writeData } = require("./lib");

const KEY = process.env.GDRIVE_API_KEY;

(async function main() {
	console.log("Getting sheet modification time...");

	// fetch modification time from source google sheet
	await fetch(`https://www.googleapis.com/drive/v3/files/1-Csmn_rXTQvnkJR8tnFkQEyKBnhq8fz-YxyHidhONiI?key=${KEY}&fields=modifiedTime`)
	.then(res => res.json())
	.then(json => {
		if (!('modifiedTime' in json)) {
			console.log(json);
			throw "Error getting modification time of the sheet";
		}
		return moment(json.modifiedTime).tz("Asia/Rangoon").format('DD/MM/YYYY hh:mm:ss');
	})
	.then(modifiedTime => {
		data.statewise.forEach((part, index, theArray) => {
			part['lastupdatedtime'] = modifiedTime
			this[index] = part;
		}, data.statewise);

		writeData({file: 'data.json', data: data})

		console.log("End of set-updated-time...");
	})
	.catch(err => {
		console.log(err);
		process.exit(1);
	})
})();