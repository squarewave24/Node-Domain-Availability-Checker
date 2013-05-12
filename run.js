var https = require('https');
var mgr = require('./domainQueryMgr.js');

mgr.resultAddedEvt(resultsReceived)


// [0]: domains to check (generate up to n)
// [1]: batch size
// [2]: show response xml
mgr.checkDomain(
    GenerateDomainNames(30),
    20,
    false
);


function GenerateDomainNames(limit) {
    var letters = ("abcdefghijklmnopqrstuvwxyz").split('');
    var domains = [];
    for (var l1 in letters)
        for (var l2 in letters)
            for (var l3 in letters)
            if (limit-- > 0)
                domains.push(letters[l1] + letters[l2] + letters[l3] + '.io');

    return domains;
}

function resultsReceived() {
    if (mgr.results.length >= domains.length){  // wait for all batches to finish

        console.log('\n\nAvailable Domains!')
        for (var i=0; i<mgr.results.length; i++){
            var res = mgr.results[i];
            if (res.isAvailable){
                process.stdout.write('  ' + res.domain + '   ');
                if (i % 10 == 0) process.stdout.write('\n');
            }
        }

        console.log('\nfinished..');
    }
}