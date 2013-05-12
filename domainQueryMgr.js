var https = require('https');
var resultsArr = [];
var resultsAddedEvent;
var domainTshd = 50;
var namecheapUser = 'sonicraf';
var namecheapApikey = '56fd5a6875204b3380a5eb62d5c0e880';
var namecheapApiUrl = 'api.sandbox.namecheap.com';
var namecheapApiQuery = '/xml.response?ApiUser=[USER_NAME]&ApiKey=[API_KEY]&UserName=[USER_NAME]&ClientIP=[IP]&Command=namecheap.domains.check&DomainList=[DOMAINS]';
var namecheapClientIP = '198.228.204.144';

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
    var opt = CreateRequestOptions(p);
    console.log('Executing Request...')
    var reqGet = https.request( opt, function(res) { makeRequest(res, showResponseXml) });
    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
        console.error(e.stack);
    });

}

function CreateRequestOptions(pathString) {
    var url = namecheapApiUrl
    var p = namecheapApiQuery
        .replace('[USER_NAME]', namecheapUser)
        .replace('[API_KEY]', namecheapApikey)
        .replace('[DOMAINS]', pathString)
        .replace('[IP]', namecheapClientIP)
        .replace('[USER_NAME]', namecheapUser);

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

function write(o){
    for (var prop in o){
        console.log(prop + ' : ' + o[prop]);
    }
};

function ask(question, format, callback) {
    var stdin = process.stdin, stdout = process.stdout;

    stdin.resume();
    stdout.write(question + ": ");

    stdin.once('data', function(data) {
        data = data.toString().trim();

        if (format.test(data)) {
            callback(data);
        } else {
            stdout.write("It should match: "+ format +"\n");
            ask(question, format, callback);
        }
    });
}