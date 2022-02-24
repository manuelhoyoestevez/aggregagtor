const { produce } = require('../publishRabbit.js')
const {urlDCE} = require('../config')
const settings = {
    method: 'POST',
    headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'Authorization': 'Basic YXBjOmFwYzIwMjA='
    },
    body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:isx="http://www.apc.com/stdws/xsd/ISXCentralAlarms-v2">
        <soapenv:Header/>
        <soapenv:Body>
        <isx:getAllActiveAlarmsRequest>
            <!--Optional:-->
            <isx:locale>es</isx:locale>
        </isx:getAllActiveAlarmsRequest>
        </soapenv:Body>
    </soapenv:Envelope>`
};

const fetch = require("node-fetch");
const DomParser = require('dom-parser');
const domParser = new DomParser();

(async()=> {

    const result = {
        'TIMESTAMP': new Date(),
        'WARNING':0,
        'INFORMATIONAL':0,
        'FAILURE':0,
        'CRITICAL':0,
        'total':0,
    };

    try {
        const fetchResponse = await fetch(urlDCE, settings);
        const xmlDataAlarms = await fetchResponse.text();
        const dom = domParser.parseFromString(xmlDataAlarms);
        const nodeArray = dom.getElementsByTagName('ns2:ISXCAlarmSeverity');
        const values = nodeArray.map(node => node.innerHTML);

        //console.log("respuesta", fetchResponse.promise);
        //console.log("respuesta", await fetchResponse.text());
        //console.log("data ALARMS", dataAlarms);
        //console.log("data ALARMS", dom);
        console.log("values severity", values);


        for (let i = 0; i < values.length; ++i) {
            if (!result[values[i]])
                result[values[i]] = 0;
            ++result[values[i]];
        }    
        console.log("result: ", result);
       
      }
      catch (err) {
        console.log('fetch failed', err);
      }

    produce(JSON.stringify({
        type: 'AgregadorDCE',        
        dataAlarms: result

    }))   

})()
