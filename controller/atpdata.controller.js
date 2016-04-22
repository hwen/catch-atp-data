var superagent = require('superagent');
var cheerio = require('cheerio');

// routes
exports.getRank = getRank;
exports.getTournaments = getTournaments;
exports.getPlayerList = getPlayerList;
exports.getPlayerDetail = getPlayerDetail;
exports.getStats = getStats;


function getRank(req, res) {
    var url = "http://www.atpworldtour.com/en/rankings/singles";

    superagent.get(url)
        .end(function (err, sres) {
            
            if (err) {
                res.send(err);
            }

            var $ = cheerio.load(sres.text);
            var rank = {};

            rank.date = $('.current', '#filterHolder').text();
            rank.items = [];

            var table = $('tbody','#rankingDetailAjaxContainer');
            
            $('tr', table).each(function(index, element) {
                if ( (index + 1) > 50) return;

                var el = $(element);

                rank.items.push({
                    rank: $('.rank-cell', el).text(),
                    player: $('.player-cell', el).text(),
                    country: $('img', el).attr('alt'),
                    age: $('.age-cell', el).text(),
                    points: $('.points-cell', el).text(),                   
                    tourn: $('.tourn-cell', el).text()
                });
            });

            res.send(rank);
        });
}


function getTournaments(req, res) {
    var url = 'http://cn.atpworldtour.com/Tournaments/Event-Calendar.aspx';

    superagent.get(url)
        .end(function (err, sres) {
            
            if (err) {
                res.send(err);
            }

            var $ = cheerio.load(sres.text);
            var tournaments = {};
            tournaments.turnOfYear = [];
            tournaments.recent = [];

            tournaments.year = $('h1', '#calendarHeader').text();

            $('.calendarTable').each(function(index, el) {
                var tempTurnList = {};
                tempTurnList.month = (index+1) + '月';
                tempTurnList.turns = [];

                $('tr', el).each(function(i, element) {
                    var tdArr = $('td', element);

                    var detail = {
                        name: $('a', tdArr[2]).text(),
                        place: $($('strong', tdArr[2])[1]).text(),
                        level: getTurnLevel(tdArr[0]),
                        startDate: $(tdArr[1]).text(),
                        type: $(tdArr[3]).text(),
                        champion: $($('a', tdArr[7])[0]).text()
                    };

                    tempTurnList.turns.push(detail);

                    if ( $(tdArr[1]).hasClass('liveMatch') ) {
                        tournaments.recent.push(detail);
                    }
                });

                tournaments.turnOfYear.push(tempTurnList);
            });

            res.send(tournaments);
            

            function getTurnLevel(element) {
                var img = $('img', element).attr('alt');

                if (img.indexOf('250') > -1)
                    return 'ATP250';
                else if (img.indexOf('500') > -1)
                    return 'ATP500';
                else if (img.indexOf('1000') > -1)
                    return 'ATP1000';
                else 
                    return img;
            }
        });

}

//top 200 guys
function getPlayerList(req, res) {
    var urls = [
        'http://cn.atpworldtour.com/Rankings/Singles.aspx?d=18.04.2016&r=1&c=#',
        'http://cn.atpworldtour.com/Rankings/Singles.aspx?d=18.04.2016&r=101&c=#'
    ];

    var playerList = [];

    catchPlayerList(urls[0], res, function(list1) {

        catchPlayerList(urls[1], res, function(list2) {
            playerList = list1.concat(list2);

            res.send(playerList);
        });

    });
}


function catchPlayerList(url, res, callback) {

    superagent.get(url)
        .end(function(err, sres) {

            if (err) {
                res.send(err);
            }

            var $ = cheerio.load(sres.text);
            var playerList = [];
            var baseUrl = 'http://cn.atpworldtour.com';

            var tr = $('tr', '.bioTableAlt');

            for (var i=1; i<tr.length; i++) {
                var firstTd = $('.first', tr[i]);
                playerList.push({
                    name: $('a', firstTd).text(),
                    nameEn: getEnglishName($('a', firstTd).attr('href')),
                    url: baseUrl + $('a', firstTd).attr('href'),
                    rank: $('.rank', firstTd).text()
                });
            }

            callback(playerList);
        });

    function getEnglishName(str) {
        var temp = str.split('/');

        temp = temp.filter(function(item) {
            if (item.indexOf('.aspx') > -1) {
                return true;
            }
        });

        temp = temp[0].substr(0, temp[0].indexOf('.aspx'));

        return temp.replace(/-/gi, ' ');    
    }
}

function getPlayerDetail(req, res) {
    var url = 'http://cn.atpworldtour.com/Tennis/Players/Al/R/Radu-Albot.aspx';

    var baseUrl = 'http://cn.atpworldtour.com';

    superagent.get(url)
        .end(function(err, sres) {
            if (err) {
                res.send(err);
            }

            var $ = cheerio.load(sres.text);
            var infoList = $('li', '#playerBioInfoList');

            var playerDetail = {
                name: $('h1', '#playerBioInfoCardHeader').text(),
                age: $(infoList[0]).text(),
                shot: baseUrl + $('img', '#playerBioHeadShot').attr('src'),
                birthplace: $(infoList[1]).text(),
                height: $(infoList[3]).text(),
                type: $(infoList[5]).text(),
                turnPro: $(infoList[6]).text(),
                website: $(infoList[7]).text()
            };

            res.send(playerDetail);
        })
}

function getStats(req, res) {
    var params = {
        statsType: req.params.statsType,
        year: req.params.year,
        surface: req.params.surface
    };

    console.log(params);

    var fn = getStatsTypeFn(params.statsType);

    fn(params.year, params.surface, function(data) {
        res.send(data);
    });
}


function getStatsTypeFn(statsType) {
    var fn;
    switch(params.statsType) {
        case 'aces':
            fn = getAceStats;
            break;
        case '1st-serve':
            fn = getFirstServe;
            break;
        case '1st-serve-points-won':
            fn = getFirstSPW;
            break;
        case '2nd-serve-points-won':
            fn = getSecondSPW;
            break;
        case 'service-games-won':
            fn = getSGW;
            break;
        case 'break-points-saved':
            fn = getBPS;
            break;
        case '1st-serve-return-points-won':
            fn = getFirstSRPW;
            break;
        case: '2nd-serve-return-points-won':
            fn = getSecondSRPW;
            break;
        case 'break-points-converted':
            fn = getBPC;
            break;
        case: 'return-games-won':
            fn = getRGW;
            break;
        default:
            res.send('getStats error');
    };    
}

function getFirstSPW(year, surface, callback) {
    
}

function getSecondSPW(year, surface, callback) {

}

function getSGW(year, surface, callback) {
    
}

function getBPS(year, surface, callback) {
    
}

function getFirstSRPW(year, surface, callback) {
    
}

function getSecondSRPW(year, surface, callback) {
    
}

function getBPC(year, surface, callback) {
    
}

function getRGW(year, surface, callback) {
    
}

function getFirstServe(year, surface, callback) {
    
}

function getAceStats(year, surface, callback) {
    var url = 'http://www.atpworldtour.com/en/stats/aces/'+
    year + '/' + surface + '/all/?ajax=true';

    superagent.get(url)
        .end(function(err, sres) {
            if (err) {
                callback(err);
                return;
            }

            var $ = cheerio.load(sres.text);

            var aceStats = {};

            aceStats.title = $('.section-title', '.stats-listing-wrapper').text();
            aceStats.detail = [];

            $('.stats-listing-row').each(function(index, element) {
                var tdArr = $(element).children();

                aceStats.detail.push({
                    rank: $( $('td', tdArr[0])[0] ).text(),
                    name: $('a', '.stats-listing-name', tdArr[0]).text(),
                    acesNumber: $(tdArr[1]).text(),
                    matches: $(tdArr[2]).text()
                })
            });

            callback(aceStats);
        })
}