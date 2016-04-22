var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var app = express();

var url = "http://www.atpworldtour.com/en/rankings/singles";

app.get('/', function (req, res, next) {
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    superagent.get(url)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
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
});

/*
* rank
* 赛程
* 球员信息
* 本周赛事
* 数据统计
*/

//get user name and user-page
//url: http://cn.atpworldtour.com/Rankings/Singles.aspx


app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});