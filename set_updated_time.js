const moment = require("moment");
const data = require('./data');
const { writeData } = require("./lib");

data.statewise.forEach((part, index, theArray) => {
	part['lastupdatedtime'] = moment().tz("Asia/Rangoon").format("DD/MM/YYYY hh:mm:ss");
	this[index] = part;
}, data.statewise);

writeData({file: 'data.json', data: data})