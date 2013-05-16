var http = require('http');
var resultsArr = [];
var resultsAddedEvent;
var domainTshd = 50;

module.exports = {

    checkDomains: function(domains, batchSize, showResponseXml) {
        domainTshd  = batchSize;
        if (domains)      {
            console.log('domains to process: ' + domains.length + ' batch size: ' + domainTshd);
            if (domains.length > domainTshd){
                var domainsTmp = domains.slice(0);
                while (domainsTmp.length){
                    var arr = domainsTmp.splice(0,domainTshd);
                    mainRequest(arr.toString(), showResponseXml);
                }
            }
            else
                mainRequest(domains.toString(), showResponseXml);
        }
    },
    results: resultsArr,
    batchSize: domainTshd,
    resultAddedEvt: function(evt){
        resultsAddedEvent = evt;
    }
}


function mainRequest(p, showResponseXml){

    // do the GET request
    var opt = CreateRequestOptions(p, getNameCheapSettings());
    var reqGet = http.request( opt, function(res) {

        if (res.statusCode != 200){
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
        }
        res.setEncoding('utf8');
        res.on('data', function (chunk) {

            console.log('\n *****************************************  data received.. ' + chunk)

            if (showResponseXml)
                console.log('ResponseXml: ' + chunk);
            if (GetAvalabilityStatus(chunk)){
                if (typeof resultsAddedEvent == "function"){
                    resultsAddedEvent();
                }
            }
            else
                console.log('ERROR: could not get status from: ' + chunk);

        });
//        res.on('end', function() {
//            console.log(' ************************************************** the end')
//        });
    });
    reqGet.end();

    reqGet.on('error', function(e) {
        console.error(e);
//        console.error(e.stack);
        console.dir(e);
    });

}

function CreateRequestOptions(pathString, ncSettings) {
    var url = ncSettings.url
    var p = ncSettings.query
        .replace('[USER_NAME]', ncSettings.user)
        .replace('[API_KEY]', ncSettings.apiKey)
        .replace('[DOMAINS]', pathString)
        .replace('[IP]', ncSettings.clientIp)
        .replace('[USER_NAME]', ncSettings.user);

    console.log('Creating Request ' + url + p) //  + url + p)

    var optionsget = {
        host: url,
        // (no http/http !)
        port: 80,
        path: p.replace('{0}', pathString),
        method: 'GET' // do GET
    };
    return optionsget;
}

function GetAvalabilityStatus(d) {
    try {

        return require('xml2js').parseString(d, function (err, result) {

            var obj = GetObjectFromXml(result);
            var resposeArr = obj.ApiResponse.CommandResponse[0].DomainCheckResult;
            console.log('\nremote call completed. **** Execution Time: ' + obj.ApiResponse.ExecutionTime + ' domains checked: ' + resultsArr.length);
            for (var i in resposeArr){
                var r = resposeArr[i];
                resultsArr.push({
                    isAvailable: r.$.Available == 'true',
                    domain: r.$.Domain
                });
            }
            return true;

        });
    }
    catch (e) {
        console.log('problem with ' + e.message);
    }
    return false;
}

function GetObjectFromXml(xmlObject){
    if (xmlObject){
        try {

            var s = JSON.stringify(xmlObject);
            return JSON.parse(s)
        }
        catch(e) {
            console.log(e);

        }
    }
    return null;
}

function getNameCheapSettings() {
    return {
        user:       'sonicraf',
        apiKey:     '4ba061d21c2a49cdb1d90e87fc241aa2',
        url:        'api.sandbox.namecheap.com',
        query:      '/xml.response?ApiUser=[USER_NAME]&ApiKey=[API_KEY]&UserName=[USER_NAME]&ClientIP=[IP]&Command=namecheap.domains.check&DomainList=[DOMAINS]',
        clientIp:    '198.228.201.161' // '74.66.231.216' //
    }
}

