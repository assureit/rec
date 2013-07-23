var http = require('http');
var url = require('url');
var Const = require('../public/const');

// エビデンスリスト表示
exports.list = function (req, res) {
    try {
        console.log("load evidenceList");
        var result_val = null;
        var totalList = 0;
        var nowPage = 0;
        var pageLimit = Const.LIST_LIMIT;

        // ページ指定
        var query_page = url.parse(req.url, true).query.page;
        if (query_page != undefined) {
            nowPage = query_page - 1;
        }

        // エビデンスリスト取得API
        var key = null;
        var queryStr = "";
        var selNodeID = url.parse(req.url, true).query.nodeID;
        if (selNodeID!=undefined && selNodeID!=null && selNodeID!='') {
            key = { nodeID: selNodeID };
            queryStr = 'nodeID=' + selNodeID;
        }
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection) {
            collection.find(key).count(function (err, count) {
                totalList = count;
                if (nowPage < 0 || (nowPage * pageLimit > totalList)) {
                    nowPage = parseInt((totalList - 1) / pageLimit);
                }

                collection.find(key, { _id: 0, entrytime: 0 }).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        collection.distinct('nodeID', function (err, node_list) {
                            //console.log(JSON.stringify(item_list));
                            var count = item_list.length;
                            res.render('evidenceList', {
                                title: 'エビデンス一覧',
                                site: Const.SITE,
                                url: 'evidenceList',
                                totalList: totalList,
                                page: nowPage,
                                limit: pageLimit,
                                item_list: item_list,
                                node_list: node_list,
                                nodeID: selNodeID,
                                queryStr: queryStr
                            });
                        });
                    }
                });
            });
        });
    } catch (e) {
        res.render('evidenceList', { title: 'error' });
        console.log("失敗：" + e);
    }
};

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download evidence ----");

        var key = null;
        var selNodeID = url.parse(req.url, true).query.nodeID;
        if (selNodeID!=undefined && selNodeID!=null && selNodeID!='') {
            key = { nodeID: selNodeID };
        }
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection) {
            collection.find(key, { _id: 0, entrytime: 0 }).sort(order).toArray(function (err, item_list) {
                if (err) {
                    console.log('error: An error has occurred');
                    throw err;
                } else {
                    // データダウンロード
                    res.statusCode = 200;
                    var filename = Const.DB_TABLE_EVIDENCE + '_' + Const.getDateString() +'.json';
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
