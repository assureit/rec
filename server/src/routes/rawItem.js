var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');


// rawアイテムリスト表示
exports.list = function (req, res) {
    try {
        console.log("load getRawItemList");
        var result_val = null;
        var totalList = 0;
        var nowPage = 0;
        var pageLimit = Const.LIST_LIMIT;

        // ページ指定
        var query_page = url.parse(req.url, true).query.page;
        if (query_page != undefined) {
            nowPage = query_page - 1;
        }

        // rawアイテムリスト取得API
        db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
        db.open(function (err, db) {
            if (!err) {
                var where = null;
                var order = { _id: -1 };      // -1:desc 1:asc
                db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
                    collection.find(where).count(function (err, count) {
                        totalList = count;
                        collection.find(where, { _id: 0 }).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                            if (err) {
                                console.log('error: An error has occurred');
                                throw err;
                            } else {
                                //console.log(JSON.stringify(item_list));
                                var count = item_list.length;
                                res.render('rawItemList', {
                                    title: 'rawアイテム一覧',
                                    url: 'rawItemList',
                                    totalList: totalList,
                                    page: nowPage,
                                    limit: pageLimit,
                                    item_list: item_list
                                });
                            }
                        });
                    });
                });
            }
        });
    } catch (e) {
        res.render('rawItemList', { title: 'error' });
        console.log("失敗：" + e.Message);
    }
};

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download RawItem ----");

        db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
        db.open(function (err, db) {
            if (!err) {
                var order = { _id: -1 };      // -1:desc 1:asc
                db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
                    collection.find(null, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                        if (err) {
                            console.log('error: An error has occurred');
                            throw err;
                        } else {
                            // データダウンロード
                            res.statusCode = 200;
                            var filename = Const.DB_TABLE_RAWITEM + '_' + Const.getDateString() +'.json';
                            res.set('Content-Disposition','attachment; filename="' + filename + '"');
                            res.setHeader('Content-Type', 'text/json; charset=utf8');
                            
                            res.write( JSON.stringify(item_list) );
                            //item_list.forEach(function(item) {
                            //    res.write( JSON.stringify(item) + '\n' );
                            //});
                            res.end();
                        }
                    });
                });
            }
        });
    } catch (e) {
        console.log("download error：" + e.Message);
    }
}

