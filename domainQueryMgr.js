var https = require('https');
var resultsArr = [];
var resultsAddedEvent;
var domainTshd = 50;

module.exports = {

    checkDomain: function(domains, batchSize, showResponseXml) {
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
    console.log('Executing Request...')
    var reqGet = https.request( opt, function(res) { makeRequest(res, showResponseXml) });
    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
        console.error(e.stack);
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

    // console.log(p);

    var optionsget = {
        host: url,
        // (no http/https !)
        port: 443,
        path: p.replace('{0}', pathString),
        method: 'GET' // do GET
    };
    return optionsget;
}

function makeRequest(res, showResponseXml) {
    res.on('data', function(d) {

        var parseString = require('xml2js').parseString;
        parseString(d, function (err, result) {

            if (showResponseXml)
                console.log(JSON.stringify(result));

            var obj = GetObjectFromXml(result);
            var status = GetAvalabilityStatus(obj);
            if (status){
                // resultsArr.push(status);
                if (typeof resultsAddedEvent == "function"){
                    resultsAddedEvent();
                }
            }
            else
                console.log('staus is empty'  + d);
        });
    });

    function GetAvalabilityStatus(obj) {
        try {
            var resposeArr = obj.ApiResponse.CommandResponse[0].DomainCheckResult;
            console.log('\nremote call completed. **** Execution Time: ' + obj.ApiResponse.ExecutionTime + ' domains checked: ' + resultsArr.length);
            for (var i in resposeArr){
                var r = resposeArr[i];

                // console.log(!!r.$.Available + ' from: ' + r.$.Available)

                resultsArr.push(
                    {
                        isAvailable: r.$.Available == 'true',
                        domain: r.$.Domain
                    }
                );
            }

            return true;
        }
        catch (e) {
            console.log('problem with ' + e.message);
        }
        return false;
    }
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
        user:       'xx',
        apiKey:     'xx',
        url:        'api.sandbox.namecheap.com',
        query:      '/xml.response?ApiUser=[USER_NAME]&ApiKey=[API_KEY]&UserName=[USER_NAME]&ClientIP=[IP]&Command=namecheap.domains.check&DomainList=[DOMAINS]',
        clientIp:   'xx'
    }
}
