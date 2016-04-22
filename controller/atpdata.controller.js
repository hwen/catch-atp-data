var superagent = require('superagent');
var cheerio = require('cheerio');

exports.getRank = getRank;
exports.getTournaments = getTournaments;


function getRank(req, res, next) {
    var url = "http://www.atpworldtour.com/en/rankings/singles";

    superagent.get(url)
        .end(function (err, sres) {
            
            if (err) {
                return next(err);
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
                return next(err);
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
