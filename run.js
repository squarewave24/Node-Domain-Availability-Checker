var mgr = require('./domainQueryMgr.js');
var domainLimit = 242;
var extensions = ['io'];
var batch = 0;
var responseArr = [];
mgr.resultAddedEvt(resultsReceived)


var domains = GenerateDomainNames(domainLimit, 'r');

// [0]: domains to check (generate up to n)
// [1]: batch size
// [2]: show response xml
mgr.checkDomains(
    domains,
    3,
    false,
    receiveResults
);


function receiveResults(resposeArr, time){

//    console.log('batch ' + batch  + 'received with ' + resposeArr.length + ' results. in: ' + time);
    if (batch++ == 0)
        console.log('available!');
    for (var i=0; i<resposeArr.length; i++){
        var res = resposeArr[i];
        responseArr.push(res);
        if (res.isAvailable){
            process.stdout.write('  ' + res.domain + '   ');
            if (i % 10 == 0) process.stdout.write('\n');
        }
    }

    if (responseArr.length == domains.length){
        console.log('finished..');
    }
}

function getLetters() {
    return ("abcdefghijklmnopqrstuvwxyz").split('');
}

function GenerateDomainNames(limit, startingLetter, wordSize) {
    var domains = [];
    var letters = getLetters();
//    var arr = [];
//
//    for (var x=0;x<wordSize; x++) {
//        console.log('asdfasdf')
//        arr[x] = [];
//        for (var i in letters){
//            console.log('appending ' + x + ' ' + i + ' ' + letters[i]);
//            appendLetter(x,i, letters[i], arr);
//        }
//    }
//
//   console.dir(arr);

    for (var l1 in letters)
        if (!startingLetter || letters[l1] == startingLetter);
        for (var l2 in letters)
            for (var l3 in letters)
                if (limit-- > 0)
                    for (var e in extensions)
                        domains.push(letters[l1] + letters[l2] + letters[l3] + '.' + extensions[e]);

    return domains;
}

function appendLetter(x,y,letter, arr){
    arr[x][y] = letter;
}


function resultsReceived() {

    console.log(' *** results received ** ' + mgr.results.length);
    if ( mgr.results.length >= domainLimit){  // wait for all batches to finish

        console.log('\n\nAvailable Domains!')
        for (var i=0; i<mgr.results.length; i++){
            var res = mgr.results[i];
            if (res.isAvailable){
                process.stdout.write('  ' + res.domain + '   ');
                if (i % 10 == 0) process.stdout.write('\n');
            }
        }
        t.stop();

        console.log('\n\n *** finished.. ' + t.getTime());
    }
}

var timer = function(){

    var start,
        end;

    return {
        start: function(){
            start = new Date().getTime();
        },
        stop: function(){
            end = new Date().getTime();
        },
        getTime: function(){
            return time = end - start;
        }
    };
};
var t = timer();
t.start();