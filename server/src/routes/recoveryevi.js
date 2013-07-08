var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');

// エビデンスリスト表示
exports.list = function (req, res) {
    try {
        console.log("load recoveryeviList");
        var result_val = null;
        var totalList = 0;
        var nowPage = 0;
        var pageLimit = Const.LIST_LIMIT;

        // ページ指定
        var query_page = url.parse(req.url, true).query.page;
        if (query_page != undefined) {
            nowPage = query_page - 1;
        }

        // リカバリスクリプトエビデンス取得
        var key = null;
        var queryStr = "";
        var selNodeID = url.parse(req.url, true).query.nodeID;
        if (selNodeID != undefined) {
            key = { nodeID: selNodeID };
            queryStr = 'nodeID=' + selNodeID;
            console.log('nodeID: ' + JSON.stringify(key));
        }
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_RECOVERY, function (err, collection) {
            collection.find(key).count(function (err, count) {
                totalList = count;
                collection.find(key, { _id: 0, entrytime: 0 }).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        //console.log(JSON.stringify(item_list));
                        var count = item_list.length;
                        res.render('recoveryeviList', {
                            title: 'リカバリスクリプトエビデンス一覧',
                            site: Const.SITE,
                            url: 'recoveryeviList',
                            totalList: totalList,
                            page: nowPage,
                            limit: pageLimit,
                            item_list: item_list,
                            queryStr: queryStr
                        });
                    }
                });
            });
        });
    } catch (e) {
        res.render('recoveryeviList', { title: 'error' });
        console.log("失敗：" + e);
    }
};

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download recoveryeviList ----");

        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_RECOVERY, function (err, collection) {
            collection.find(null, { _id: 0, entrytime: 0 }).sort(order).toArray(function (err, item_list) {
                if (err) {
                    console.log('error: An error has occurred');
                    throw err;
                } else {
                    // データダウンロード
                    res.statusCode = 200;
                    var filename = Const.DB_TABLE_RECOVERY + '_' + Const.getDateString() +'.json';
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
    } catch (e) {
        console.log("download error：" + e);
    }
}
