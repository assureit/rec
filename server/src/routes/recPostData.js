var mongo = require('mongodb');
var Const = require('../public/const');

exports.getJsonData = function (req, res) {
    try {
        console.log("load getJsonData");
        var result_val = null;
        var method_val = req.body.method;
        console.log("■ method=" + method_val);
 
        if (method_val == "rawDataRecord") {
            // rawデータ記録API
            addRawData(req, res);
        } else if (method_val == "resultDataRecord") {
            // 実行結果記録API
            addResultData(req, res);
        } else if (method_val == "getRawItemList") {
            // RawアイテムマスタリストAPI
            getRawItemList(req, res);
        } else if (method_val == "getPresetList") {
            // プロパティマスタリストAPI
            getPresetList(req, res);
        } else if (method_val == "getMonitor") {
            // モニタ情報リストAPI
            getMonitorList(req, res);
        } else if (method_val == "registMonitor") {
            // 監視項目登録API
            registMonitor(req, res);
        } else if (method_val == "updateMonitor") {
            // 監視項目更新API
            updateMonitor(req, res);
        } else if (method_val == "deleteMonitor") {
            // 監視項目削除API
            deleteMonitor(req, res);
        } else {
            // ないAPI？
            throw "unkown function :" + method_val;
        }

    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", "error": e }))
        console.log("失敗：" + e.Message);
    }
};

// rawデータ記録
function addRawData(req, res) {
    var id_val = req.body.id;
    var params_val = req.body.params;
    var watchID_val = params_val.watchID;
    var timestamp_val = Const.getIsoDateString();
    console.log('timestamp: ' + timestamp_val);
    var rawID_val = watchID_val + Const.getDateString();
    var data_val = params_val.data;
    var priority_val = params_val.priority;
    if (priority_val == null || priority_val == undefined) {
        priority_val = 0;
    }
    console.log('Adding rawData: ' + JSON.stringify(params_val));
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
                doc = { rawID: rawID_val, watchID: watchID_val, timestamp: timestamp_val, data: data_val, priority: priority_val };
                collection.insert(doc, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            });
        }
    });
};

// エビデンス記録
function addResultData( req, res ) {
    var id_val = req.body.id;
    var params_val = req.body.params;
    var nodeID_val = params_val.nodeID;
    // モニタIDが登録済みかどうかの判定？

    console.log('→ nodeID: ' + nodeID_val);
    var evidenceID_val = nodeID_val + Const.getDateString();
    console.log('→ evidenceID: ' + evidenceID_val);
    var timestamp_val = params_val.data.timestamp;
    var status_val = params_val.data.errorcode;

    console.log('Adding resultData: ' + JSON.stringify(params_val));
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection) {
                doc = { evidenceID: evidenceID_val, nodeID: nodeID_val, timestamp: timestamp_val, status: status_val };
                collection.insert(doc, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            });
        }
    });
};

// rawアイテムマスタリストの取得
function getRawItemList(req, res) {
    var id_val = req.body.id;
    var params_val = req.body.params;
    console.log('get raw_item list: ' + JSON.stringify(params_val));
    sort = null;
    if (params_val != null) {
        sort = { datatype: params_val };
    };
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
                collection.find(sort, { _id: 0 }).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        console.log(item_list);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            });
        }
    });
};

// プリセット情報リストの取得
function getPresetList(req, res) {
    var id_val = req.body.id;
    var params_val = req.body.params;
    console.log('get preset list: ' + JSON.stringify(params_val));
    sort = null;
    if (params_val != null) {
        //sort = { datatype: params_val };  現在指定なし
    };
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            db.collection(Const.DB_TABLE_PRISET, function (err, collection) {
                collection.find(sort, { _id: 0 }).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        console.log(item_list);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            });
        }
    });
};

// モニタ情報リストの取得
function getMonitorList(req, res) {
    var id_val = req.body.id;
    var params_val = req.body.params;
    sort = null;
    if (params_val.nodeID != null) {
        sort = { nodeID: params_val.nodeID };
    };
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            console.log('get monitor list: ' + JSON.stringify(sort));
            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                collection.find(sort, { _id: 0 }).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        console.log(item_list);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            });
        }
    });
};

// モニタ情報の登録
function registMonitor(req, res) {
    var id_val = req.body.id;
    var nodeID_val = req.body.params.nodeID;
    var name_val = req.body.params.name;
    var watchID_val = req.body.params.watchID;
    var presetID_val = req.body.params.presetID;
    var params_val = req.body.params.params;

    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            console.log('regist Monitor: ' + JSON.stringify(req.body.params));
            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                data = { nodeID: nodeID_val, name: name_val, watchID: watchID_val, presetID: presetID_val, params: params_val };
                collection.insert(data, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred');
                        throw err;
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            });
        }
    });
};

// モニタ情報の更新
function updateMonitor(req, res) {
    var id_val = req.body.id;
    var nodeID_val = req.body.params.nodeID;
    var name_val = req.body.params.name;
    var watchID_val = req.body.params.watchID;
    var presetID_val = req.body.params.presetID;
    var params_val = req.body.params.params;

    console.log('update Monitor: ' + JSON.stringify(req.body.params));
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                key = { nodeID: nodeID_val };
                collection.findOne(key, function (err, item) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred - ' + err });
                        throw err;
                    } else {
                        item.name = name_val;
                        item.watchID = watchID_val;
                        item.presetID = presetID_val;
                        item.params = params_val;
                        collection.update(key, item, { safe: true }, function (err, result) {
                            if (err) {
                                console.log('Error updating monitor: ' + err);
                                throw err;
                            } else {
                                console.log('Success: ' + JSON.stringify(result[0]));
                                res.contentType('application/json');
                                res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                            }
                        });

                    }
                });
            });
        }
    });
};

// モニタ情報の削除
function deleteMonitor(req, res) {
    var id_val = req.body.id;
    var nodeID_val = req.body.params.nodeID;

    console.log('delete Monitor: ' + JSON.stringify(req.body.params));
    db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
    db.open(function (err, db) {
        if (!err) {
            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                key = { nodeID: nodeID_val };
                collection.remove(key, { safe: true }, function (err, result) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred - ' + err });
                        throw err;
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            });
        }
    });
};


