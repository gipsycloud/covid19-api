const fs = require('fs');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const {detailedDiff} = require('deep-object-diff');
const data = require('../tmp/data.json');
const raw_data = require('../tmp/raw_data.json').raw_data;
const raw_data_prev = require('../tmp/raw_data_prev.json').raw_data;

update_log_file = './tmp/updatelog/log.json';
var update_log = require("."+update_log_file);
BOT_TOKEN = process.env.BOT_TOKEN;


function makeLocationString(entry) {
    return `${entry.detectedcity}, ${entry.detectedstate}`
}

function getChangeSet() {
    const diff = detailedDiff(raw_data_prev, raw_data);
    // console.log(util.inspect(diff, false, null, true /* enable colors */));

    const {added, updated} = diff;

    let deltaCities = Object.keys(added).reduce((prev, index) => {
        const updatedContent = added[index];
        if ('patientnumber' in updatedContent) {
            const location = makeLocationString(updatedContent)
            prev[location] = prev[location] || {};
            prev[location]['case'] = (prev[location]['case'] || 0) + 1;
        }
        return prev;
    }, {});

    deltaCities = Object.keys(updated).reduce((prev, index) => {

        const updatedContent = updated[index];
        const fullContent = raw_data[index];
        const location = makeLocationString(fullContent);

        if ('currentstatus' in updatedContent && 'dischargeddeceaseddate' in updatedContent) {
            switch (updatedContent.currentstatus) {
                case 'Recovered':
                    prev[location] = prev[location] || {};
                    prev[location]['recover'] = (prev[location]['recover'] || 0) + 1;
                    break;
                case 'Deceased':
                    prev[location] = prev[location] || {};
                    prev[location]['death'] = (prev[location]['death'] || 0) + 1;
                    break;
            }
        }

        return prev;
    }, deltaCities);

    return deltaCities;
}

(function generateLog() {
    const changeset = getChangeSet();

    var full_text = "";
    var tg_full_text = "";

    statewise = data.statewise.reduce((arr, row)=>{
        arr[row.state] = row;
        return arr;
    },{});

    const isChanged = Object.keys(changeset).length !== 0;
    if (isChanged) {
        total = statewise["Total"];

        const texts = Object.keys(changeset).reduce((prev, location) => {
            const change = changeset[location];
            prev[location] = Object.keys(change).reduce((prev, type) => {
                const count = change[type];
                const newOrSpace = type === 'case' ? ' new ' : ' ';
                const sORes = type === 'recover' ? 'ies' : 's';
                const pluralMaybe = count === 1 ? '' : sORes;
                prev.push(`${count}${newOrSpace}${type}${pluralMaybe}`);
                return prev;
            }, []);
            return prev
        }, {});

        full_text = Object.keys(texts).reduce((prev, location) => {
            const parts = texts[location];
            let text = '';
            if (parts.length > 2) {
                const last = parts.pop();
                text = `${parts.join(', ')} and ${last}`;
            } else {
                text = parts.join(', ');
            }
            prev = prev === '' ? '' : `${prev}\n`;
            return `${prev}${text} in ${location}`;
        }, "")

        tg_full_text = full_text + "\n"
            + "``` Total cases: (↑" + total.deltaconfirmed + ") " + total.confirmed
            + "\n" + " Recovered  : (↑" + total.deltarecovered + ") " + total.recovered
            + "\n" + " Deaths     : (↑" + total.deltadeaths + ") " + total.deaths + "```";
    }

    if (full_text!=""){
        console.log(full_text);
        
        const now = moment().unix()
        entry = {};
        entry.update = full_text;
        entry.timestamp = now;
        update_log.push(entry);
        update_log = update_log.slice(-50)
        
        fs.writeFileSync(update_log_file, JSON.stringify(update_log, null, 2));

        var date = moment.unix(now);
        formated_time = date.tz("Asia/Rangoon").format("MMMM DD, hh:mm A");
        console.log(formated_time)
        

        url = encodeURI("https://api.telegram.org/bot"+BOT_TOKEN+"/sendmessage?parse_mode=Markdown&chat_id=-258782427&text=_"
            +formated_time+"_\n\n"
            +tg_full_text
            +"\n\n*covid19.ttkz.me*");
        // console.log(url);
        let settings = { method: "Get" };
        fetch(url, settings).then(res => res.json())
        .then(json => console.log(json));
        
    }else{
        console.log("No updates this time!");
    }
})();