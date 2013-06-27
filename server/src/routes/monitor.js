var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');

// モニタリスト表示
function displist(req, res) {
    try {
        console.log("load getmonitorList");
        var result_val = null;
        var totalList = 0;
        var nowPage = 0;
        var pageLimit = Const.LIST_LIMIT;

        // ページ指定
        var query_page = url.parse(req.url, true).query.page;
        if (query_page != undefined) {
            nowPage = query_page - 1;
        }

        // モニタ取得API
        var key = null;
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            collection.find(key).count(function (err, count) {
                totalList = count;
                collection.find(key).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        //console.log(JSON.stringify(item_list));
                        var count = item_list.length;
                        res.render('monitorList', {
                            title: 'モニタ一覧',
                            site: Const.SITE,
                            url: 'monitorList',
                            url2: 'monitorEdit',
                            totalList: totalList,
                            page: nowPage,
                            limit: pageLimit,
                            item_list: item_list
                        });
                    }
                });
            });
        });
    } catch (e) {
        res.render('monitorList', { title: 'error' });
        console.log("失敗：" + e);
    }
};
exports.list = displist;

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download monitor ----");

        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            collection.find(null, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                if (err) {
                    console.log('error: An error has occurred');
                    throw err;
                } else {
                    // データダウンロード
                    res.statusCode = 200;
                    var filename = Const.DB_TABLE_MONITOR + '_' + Const.getDateString() +'.json';
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

// 編集
exports.edit = function (req, res) {
    try {
        console.log("---- edit RawItem ---- ");
        console.log("edit=" + req.body.editType + ",   _id=" + req.body.selid);

        var edit_action = req.body.editType;
        if (edit_action == "addEdit") {
            // ------------------ 追加編集 -----------------
            res.render('monitorEdit', {
                title: 'モニタの追加',
                site: Const.SITE,
                url: 'monitorList',
                url2: 'monitorEdit',
                editType: 'regist',
                selid: '',
                nodeID: '',
                watchID: '',
                presetID: '',
                name: '',
                params: '',
                error_msg: ''
            });
        } else if (edit_action == "updateEdit") {
            // ------------------ 変更編集 -----------------
            var objectId = new mongo.ObjectID(req.body.selid);
            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                var key = { _id: objectId };
                collection.findOne(key, { _id: 0 }, function (err, item) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred - ' + err });
                        throw err;
                    } else {
                        res.render('monitorEdit', {
                            title: 'モニタの変更',
                            site: Const.SITE,
                            url: 'monitorList',
                            url2: 'monitorEdit',
                            editType: 'update',
                            selid: req.body.selid,
                            nodeID: item.nodeID,
                            watchID: item.watchID,
                            presetID: item.presetID,
                            name: item.name,
                            params: item.params,
                            error_msg: ''
                        });
                    }
                });
            });

        } else if (edit_action == "regist") {
            // ------------------ 追加実行 -----------------
            registMonitor(req, res);
       } else if (edit_action == "update") {
            // ------------------ 変更実行 -----------------
            updateMonitor(req, res);
        } else if (edit_action == "delete") {
            // ------------------ 削除実行 -----------------
            deleteMonitor(req, res);
        }
    } catch (e) {
        console.log("edit error：" + e);
    }
}

// モニタ情報の登録
function registMonitor(req, res) {
    var nodeID_val = req.body.nodeID;
    var name_val = req.body.name;
    var watchID_val = req.body.watchID;
    var presetID_val = req.body.presetID;
    var params_val = req.body.params;

    try {
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            collection.find({ nodeID: nodeID_val }).toArray(function (err, item_list) {
                if( err || item_list.length>0 ) {
                    res.render('monitorEdit', {
                        title: 'モニタの追加',
                        site: Const.SITE,
                        url: 'monitorList',
                        url2: 'monitorEdit',
                        editType: 'regist',
                        selid: '',
                        nodeID: nodeID_val,
                        watchID: watchID_val,
                        presetID: presetID_val,
                        name: name_val,
                        params: params_val,
                        error_msg: 'nodeID は既に登録されています。 '
                    });
                } else {
                    var data = { nodeID: nodeID_val, name: name_val, watchID: watchID_val, presetID: presetID_val, params: params_val };
                    console.log('regist Monitor: ' + JSON.stringify(data));
                    collection.insert(data, { safe: true }, function (err, result) {
                        if (err) {
                            console.log('Error regist monitor: ' + err);
                        } else {
                            console.log('Success: ' + JSON.stringify(result[0]));
                        }
                        displist(req, res);
                    });
                }
            });
        });
    } catch (e) {
        console.log("edit error：" + e);
        displist(req, res);
    }
};

// モニタ情報の更新
function updateMonitor(req, res) {
    var objectId = new mongo.ObjectID(req.body.selid);
    var nodeID_val = req.body.nodeID;
    var name_val = req.body.name;
    var watchID_val = req.body.watchID;
    var presetID_val = req.body.presetID;
    var params_val = req.body.params;

    console.log('update Monitor: ' + JSON.stringify(req.body.selid));
    db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
        var key = { _id: objectId };
        var data = { nodeID: nodeID_val, name: name_val, watchID: watchID_val, presetID: presetID_val, params: params_val };
        collection.update(key, data, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error update monitor: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};

// モニタ情報の削除
function deleteMonitor(req, res) {
    var objectId = new mongo.ObjectID(req.body.selid);

    console.log('delete Monitor: ' + JSON.stringify(req.body.selid));
    db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
        var key = { _id: objectId };
        collection.remove(key, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error delete monitor: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};

