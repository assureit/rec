var mongo = require('mongodb');
var Const = require('../public/const');

exports.getJsonData = function (req, res) {
    try {
        var id_val = req.body.id;
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
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// rawデータ記録
function addRawData(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        var timestamp_val = Const.getIsoDateString();
        var watchID_val = params_val.watchID;
        if (watchID_val == null || watchID_val == undefined) {
            throw "There is no watchID in 'rawDataRecord'.";
        }
        var rawID_val = watchID_val + Const.getUnixtimeString();
        var datas_val = params_val.data;
        var priority_val = params_val.priority;
        if (priority_val == null || priority_val == undefined) {
            priority_val = 0;
        }

        console.log('Adding rawData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                datas_val.forEach(function (data_val) {

                    doc = { rawID: rawID_val, watchID: watchID_val, timestamp: timestamp_val, data: data_val, priority: priority_val, entrytime: new Date() };
                    collection.insert(doc, { safe: true }, function (err, result) {
                        if (err) {
                        console.log('error: An error has occurred :' + err);
                            res.contentType('application/json');
                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: "-1", message: err }, id: id_val }))
                        } else {
                            //console.log('Success: ' + JSON.stringify(result[0]));
                            res.contentType('application/json');
                            res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                        }
                    });
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
    
};

// エビデンス記録(未使用)
function addEvidence( req, res ) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        var nodeID_val = params_val.nodeID;
        if (nodeID_val == null || nodeID_val == undefined) {
            throw "There is no nodeID.";
        }

        var evidenceID_val = nodeID_val + Const.getUnixtimeString();
        var timestamp_val = params_val.data.timestamp;
        var status_val = params_val.data.errorcode;

        console.log('Adding resultData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection) {
            if (err) {
                throw err;
            } else {
                doc = { evidenceID: evidenceID_val, nodeID: nodeID_val, timestamp: timestamp_val, status: status_val, entrytime: new Date() };
                collection.insert(doc, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else {
                        //console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// リカバリスクリプトエビデンス記録
function addResultData( req, res ) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        var monitorID_val = params_val.monitorID;
        if (monitorID_val == null || monitorID_val == undefined) {
            throw "There is no monitorID in 'resultDataRecord'.";
        }

        var recoveryID_val = monitorID_val + Const.getUnixtimeString();
        var timestamp_val = params_val.data.timestamp;
        var name_val = params_val.data.name;
        var arguments_val = params_val.data.arguments;
        var errorcode_val = params_val.data.errorcode;
        var output_n_val = params_val.data.output_n;
        var output_e_val = params_val.data.output_e;

        console.log('Adding resultData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RECOVERY, function (err, collection) {
            if (err) {
                throw err;
            } else {
                doc = { recoveryID: recoveryID_val, monitorID: monitorID_val, name: name_val, arguments: arguments_val, timestamp: timestamp_val, errorcode: errorcode_val, output: output_n_val, eoutput: output_e_val, entrytime: new Date() };
                collection.insert(doc, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else {
                        //console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// rawアイテムマスタリストの取得
function getRawItemList(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;

        key = null;
        if (params_val != null) {
            key = { datatype: params_val };
        };
        var order = { _id: -1 };      // -1:desc 1:asc

        console.log('get raw_item list: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else {
                        //console.log(item_list);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// プリセット情報リストの取得
function getPresetList(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;

        var key = null;
        if (params_val != null) {
            //key = { datatype: params_val };  現在指定なし
        };
        var order = { _id: -1 };      // -1:desc 1:asc

        console.log('get preset list: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else {
                        //console.log(item_list);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// モニタ情報リストの取得
function getMonitorList(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;

        key = null;
        if (params_val != null) {
            key = { nodeID: params_val.nodeID };
        };

        console.log('get monitor list: ' + JSON.stringify(key));
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0 }).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else if(item_list.length==0) {
                        var msg = "There are no data of appointed nodeID. (" + params_val.nodeID +")";
                        console.log(msg);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: msg }, id: id_val }))
                    } else {
                        //console.log(item_list);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item_list, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// モニタ情報の登録
function registMonitor(req, res) {
    try {
        var id_val = req.body.id;
        var nodeID_val = req.body.params.nodeID;
        var name_val = req.body.params.name;
        var watchID_val = req.body.params.watchID;
        var presetID_val = req.body.params.presetID;
        var params_val = req.body.params.params;

        if (nodeID_val == null || nodeID_val == undefined) {
            throw "There is no nodeID in 'registMonitor'.";
        }
        if (watchID_val == null || watchID_val == undefined) {
            throw "There is no watchID in 'registMonitor'.";
        }
        if (presetID_val == null || presetID_val == undefined) {
            throw "There is no presetID in 'registMonitor'.";
        }

        console.log('regist Monitor: ' + JSON.stringify(req.body.params));
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find({ nodeID: nodeID_val }).toArray(function (err, item_list) {
                    if (item_list.length > 0) {
                        var msg = 'Error regist monitor: nodeID already exists. ';
                        console.log(msg);
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: "-1", message: msg }, id: id_val }))
                    } else {
                        data = { nodeID: nodeID_val, name: name_val, watchID: watchID_val, presetID: presetID_val, params: params_val };
                        collection.insert(data, { safe: true }, function (err, result) {
                            if (err) {
                                console.log('error: An error has occurred');
                                res.contentType('application/json');
                                res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: "-1", message: err }, id: id_val }))
                            } else {
                                //console.log('Success: ' + JSON.stringify(result[0]));
                                res.contentType('application/json');
                                res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// モニタ情報の更新
function updateMonitor(req, res) {
    try {
        var id_val = req.body.id;
        var nodeID_val = req.body.params.nodeID;
        var name_val = req.body.params.name;
        var watchID_val = req.body.params.watchID;
        var presetID_val = req.body.params.presetID;
        var params_val = req.body.params.params;

        if (nodeID_val == null || nodeID_val == undefined) {
            throw "There is no nodeID in 'updateMonitor'.";
        }
        if (watchID_val == null || watchID_val == undefined) {
            throw "There is no watchID in 'updateMonitor'.";
        }
        if (presetID_val == null || presetID_val == undefined) {
            throw "There is no presetID in 'updateMonitor'.";
        }

        console.log('update Monitor: ' + JSON.stringify(req.body.params));
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            if (err) {
                throw err;
            } else {
                key = { nodeID: nodeID_val };
                collection.findOne(key, function (err, item) {
                    if (err) {
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else if(item==null) {
                        var msg = "There are no data of appointed nodeID. (" + nodeID_val +")";
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: msg }, id: id_val }))
                    } else {
                        item.name = name_val;
                        item.watchID = watchID_val;
                        item.presetID = presetID_val;
                        item.params = params_val;
                        collection.update(key, item, { safe: true }, function (err, result) {
                            if (err) {
                                console.log('Error updating monitor: ' + err);
                                res.contentType('application/json');
                                res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                            } else {
                                //console.log('Success: ' + JSON.stringify(result[0]));
                                res.contentType('application/json');
                                res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                            }
                        });

                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};

// モニタ情報の削除
function deleteMonitor(req, res) {
    try {
        var id_val = req.body.id;
        var nodeID_val = req.body.params.nodeID;
        if (nodeID_val == null || nodeID_val == undefined) {
            throw "There is no nodeID in 'deleteMonitor'.";
        }

        console.log('delete Monitor: ' + JSON.stringify(req.body.params));
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            if (err) {
                throw err;
            } else {
                key = { nodeID: nodeID_val };
                collection.remove(key, { safe: true }, function (err, result) {
                    if (err) {
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: err }, id: id_val }))
                    } else {
                        //console.log('Success: ' + JSON.stringify(result[0]));
                        res.contentType('application/json');
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:"-1" , message: String(e) }, id: id_val }))
        console.log("失敗：" + e);
    }
};
