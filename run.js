var https = require('https');
var mgr = require('./domainQueryMgr.js');

mgr.resultAddedEvt(function() {
    if (mgr.results.length >= domains.length){
        // all domains checked!

        console.log('\n\nAvailable Domains!')
        for (var i=0; i<mgr.results.length; i++){
            var res = mgr.results[i];
            if (res.isAvailable){
                process.stdout.write('  ' + res.domain + '   ');
                if (i % 10 == 0) process.stdout.write('\n');
                // console.log('\t' + res.domain);
            }
        }

        console.log('\nfinished..');
    }
})

domains = GenerateDomainNames(30); // up to a limit
console.log('checking domains: ' + domains.length);



// [0]: domains to check
// [1]: batch size
// [2]: show response xml
mgr.checkDomain(domains, 20, false);





function GenerateDomainNames(limit) {
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'z'];
    var domains = [];
    for (var l1 in letters)
        for (var l2 in letters)
            for (var l3 in letters)
            if (limit-- > 0)
                domains.push(letters[l1] + letters[l2] + letters[l3] + '.io');

    return domains;
}