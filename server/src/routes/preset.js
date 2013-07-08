var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');

// プリセットリスト表示
function displist(req, res) {
    try {
        console.log("load getpresetList");
        var result_val = null;
        var totalList = 0;
        var nowPage = 0;
        var pageLimit = Const.LIST_LIMIT;

        // ページ指定
        var query_page = url.parse(req.url, true).query.page;
        if (query_page != undefined) {
            nowPage = query_page - 1;
        }

        // プリセットリスト取得API
        var key = null;
        var queryStr = "";
        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
            collection.find(key).count(function (err, count) {
                totalList = count;
                collection.find(key).sort(order).limit(pageLimit).skip(nowPage * pageLimit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        //console.log(JSON.stringify(item_list));
                        var count = item_list.length;
                        res.render('presetList', {
                            title: 'プリセット一覧',
                            site: Const.SITE,
                            url: 'presetList',
                            url2: 'presetEdit',
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
        res.render('presetList', { title: 'error' });
        console.log("失敗：" + e);
    }
};
exports.list = displist;

// ダウンロード
exports.download = function (req, res) {
    try {
        console.log("---- download preset ----");

        var order = { _id: -1 };      // -1:desc 1:asc
        db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
            collection.find(null, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                if (err) {
                    console.log('error: An error has occurred');
                    throw err;
                } else {
                    // データダウンロード
                    res.statusCode = 200;
                    var filename = Const.DB_TABLE_PRESET + '_' + Const.getDateString() +'.json';
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
        console.log("---- edit Preset ---- ");
        console.log("edit=" + req.body.editType + ",   _id=" + req.body.selid);

        var edit_action = req.body.editType;
        if (edit_action == "addEdit") {
            // ------------------ 追加編集 -----------------
            res.render('presetEdit', {
                title: 'プリセットの追加',
                site: Const.SITE,
                url: 'presetList',
                url2: 'presetEdit',
                editType: 'regist',
                selid: '',
                presetID: '',
                description: '',
                datatype: '',
                script: '',
                paramName: '',
                normalComment: '',
                errorComment: '',
                error_msg: ''
            });
        } else if (edit_action == "updateEdit") {
            // ------------------ 変更編集 -----------------
            var objectId = new mongo.ObjectID(req.body.selid);
            db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
                var key = { _id: objectId };
                collection.findOne(key, { _id: 0 }, function (err, item) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred - ' + err });
                        throw err;
                    } else {
                        res.render('presetEdit', {
                            title: 'プリセットの変更',
                            site: Const.SITE,
                            url: 'presetList',
                            url2: 'presetEdit',
                            editType: 'update',
                            selid: req.body.selid,
                            presetID: item.presetID,
                            description: item.description,
                            datatype: item.datatype,
                            script: item.script,
                            paramName: item.paramName,
                            normalComment: item.normalComment,
                            errorComment: item.errorComment,
                            error_msg: ''
                        });
                    }
                });
            });

        } else if (edit_action == "regist") {
            // ------------------ 追加実行 -----------------
            registPreset(req, res);
        } else if (edit_action == "update") {
            // ------------------ 変更実行 -----------------
            updatePreset(req, res);
        } else if (edit_action == "delete") {
            // ------------------ 削除実行 -----------------
            deletePreset(req, res);
        }
    } catch (e) {
        console.log("edit error：" + e);
    }
}

// プリセット情報の登録
function registPreset(req, res) {
    console.log('regist Preset: ');
    var presetID_val = req.body.presetID;
    var description_val = req.body.description;
    var datatype_val = req.body.datatype;
    var script_val = req.body.script;
    var paramName_val = String(req.body.paramName).replace(/\s+/g, "").split(',');
    var normalComment_val = req.body.normalComment;
    var errorComment_val = req.body.errorComment;
    console.log('regist Preset: ' + presetID_val);

    db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
        collection.find({ presetID: presetID_val }).toArray(function (err, item_list) {
            if (err || item_list.length > 0) {
                res.render('presetEdit', {
                    title: 'プリセットの追加',
                    site: Const.SITE,
                    url: 'presetList',
                    url2: 'presetEdit',
                    editType: 'regist',
                    selid: '',
                    presetID: presetID_val,
                    description: description_val,
                    datatype: datatype_val,
                    script: script_val,
                    paramName: req.body.paramName,
                    normalComment: normalComment_val,
                    errorComment: errorComment_val,
                    error_msg: 'presetID は既に登録されています。'
                });
            } else {

                var data = { presetID: presetID_val, description: description_val, datatype: datatype_val, script: script_val, paramName: paramName_val, normalComment: normalComment_val, errorComment: errorComment_val };
                console.log('regist Preset: ' + JSON.stringify(data));
                collection.insert(data, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('Error regist preset: ' + err);
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                    }
                    displist(req, res);
                });
            }
        });
    });
};

// プリセット情報の更新
function updatePreset(req, res) {
    var objectId = new mongo.ObjectID(req.body.selid);
    var presetID_val = req.body.presetID;
    var description_val = req.body.description;
    var datatype_val = req.body.datatype;
    var script_val = req.body.script;
    var paramName_val = String(req.body.paramName).replace(/\s+/g, "").split(',');
    var normalComment_val = req.body.normalComment;
    var errorComment_val = req.body.errorComment;

    console.log('update preset: ' + JSON.stringify(req.body.selid));
    db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
        var key = { _id: objectId };
        var data = { presetID: presetID_val, description: description_val, datatype: datatype_val, script: script_val, paramName: paramName_val, normalComment: normalComment_val, errorComment: errorComment_val };
        collection.update(key, data, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error update preset: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};

// プリセット情報の削除
function deletePreset(req, res) {
    var objectId = new mongo.ObjectID(req.body.selid);

    console.log('delete preset: ' + JSON.stringify(req.body.selid));
    db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
        var key = { _id: objectId };
        collection.remove(key, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error delete preset: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
            displist(req, res);
        });
    });
};
