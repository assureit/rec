var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');


// rawアイテムリスト表示
function displist(req, res) {
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
        var key = null;
        var queryStr = "";
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
            collection.find(key).count(function (err, count) {
                totalList = count;
                collection.find(key).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        //console.log(JSON.stringify(item_list));
                        var count = item_list.length;
                        res.render('rawItemList', {
                            title: 'rawアイテム一覧',
                            site: Const.SITE,
                            url: 'rawItemList',
                            url2: 'rawItemEdit',
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
        res.render('rawItemList', { title: 'error' });
        console.log("失敗：" + e);
    }
};
exports.list = displist;

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download RawItem ----");

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
            res.render('rawItemEdit', {
                title: 'rawアイテムの追加',
                site: Const.SITE,
                url: 'rawItemList',
                url2: 'rawItemEdit',
                editType: 'regist',
                selid: '',
                watchID: '',
                name: '',
                datatype: '',
                error_msg: ''
            });
        } else if (edit_action == "updateEdit") {
            // ------------------ 変更編集 -----------------
            var objectId = new mongo.ObjectID(req.body.selid);
            db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
                var key = { _id: objectId };
                collection.findOne(key, { _id: 0 }, function (err, item) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred - ' + err });
                        throw err;
                    } else {
                        res.render('rawItemEdit', {
                            title: 'rawアイテムの変更',
                            site: Const.SITE,
                            url: 'rawItemList',
                            url2: 'rawItemEdit',
                            editType: 'update',
                            selid: req.body.selid,
                            watchID: item.watchID,
                            name: item.name,
                            datatype: item.datatype,
                            error_msg: ''
                        });
                    }
                });
            });

        } else if (edit_action == "regist") {
            // ------------------ 追加実行 -----------------
            registRawItem(req, res);
        } else if (edit_action == "update") {
            // ------------------ 変更実行 -----------------
            updateRawItem(req, res);
        } else if (edit_action == "delete") {
            // ------------------ 削除実行 -----------------
            deleteRawItem(req, res);
        }
    } catch (e) {
        console.log("edit error：" + e);
    }
}

// rawアイテム情報の登録
function registRawItem(req, res) {
    console.log('regist RawItem: ');
    var watchID_val = req.body.watchID;
    var name_val = req.body.name;
    var datatype_val = req.body.datatype;
    console.log('regist RawItem: ' + watchID_val);

    db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
        var data = { watchID: watchID_val, name: name_val, datatype: datatype_val };
        console.log('regist RawItem: ' + JSON.stringify(data));
        collection.insert(data, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error regist rawItem: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};

// rawアイテム情報の更新
function updateRawItem(req, res) {
    var objectId = new mongo.ObjectID(req.body.selid);
    var watchID_val = req.body.watchID;
    var name_val = req.body.name;
    var datatype_val = req.body.datatype;

    console.log('update rawItem: ' + JSON.stringify(req.body.selid));
    db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
        var key = { _id: objectId };
        var data = { watchID: watchID_val, name: name_val, datatype: datatype_val };
        collection.update(key, data, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error update rawItem: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};

// rawアイテム情報の削除
function deleteRawItem(req, res) {
    var objectId = new mongo.ObjectID(req.body.selid);

    console.log('delete rawItem: ' + JSON.stringify(req.body.selid));
    db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
        var key = { _id: objectId };
        collection.remove(key, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error delete rawItem: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};
