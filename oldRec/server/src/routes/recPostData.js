var mongo = require('mongodb');
var async = require('async');
var Const = require('../public/const');

// rec_api
exports.getJsonData = function (req, res) {
    try {
        var id_val = req.body.id;
        var result_val = null;
        var method_val = req.body.method;
        //console.log("■ method=" + method_val);

        res.contentType('application/json');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.body.jsonrpc !== '2.0') {
            var msg = 'JSON RPC version is invalid or missiong';
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_REQUEST, message: msg }, id: id_val }), Const.HTTP_STATUS_BAD_REQUEST)
            return;
        }

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
            msg = "unkown function :" + method_val;
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_METHOD_NOT_FOUND, message: msg }, id: id_val }), Const.HTTP_STATUS_NOT_FOUND)
            return;
        }

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (getJsonData)：" + e);
    }
};

// rawデータ記録
function addRawData(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        var timestamp_val = Const.getIsoDateString();
        if (params_val == null || Const.isNull(params_val.data)) {
            var msg = "There is no data in 'rawDataRecord'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var watchID_val = params_val.watchID;
        if (Const.isNull(watchID_val)) {
            var msg = "There is no watchID in 'rawDataRecord'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var rawID_val = watchID_val + Const.getUnixtimeString();
        var datas_val = params_val.data;
        datas_val = (datas_val instanceof Array) ? datas_val : [datas_val];
        var priority_val = params_val.priority;
        if (Const.isNull(priority_val)) {
            priority_val = 0;
        }

        //console.log('Adding rawData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                datas_val.forEach(function (data_val) {

                    doc = { rawID: rawID_val, watchID: watchID_val, timestamp: timestamp_val, data: data_val, priority: priority_val, entrytime: new Date() };
                    collection.insert(doc, { safe: true }, function (err, result) {
                        if (err) {
                            console.log('error: An error has occurred :' + err);
                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                            return;
                        } else {
                            //console.log('Success: ' + JSON.stringify(result[0]));
                            res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                        }
                    });
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (addRawData)：" + e);
    }
    
};

// エビデンス記録(未使用)
function addEvidence( req, res ) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        var nodeID_val = params_val.nodeID;
        if (Const.isNull(nodeID_val)) {
            var msg = "There is no nodeID.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }

        var evidenceID_val = nodeID_val + Const.getUnixtimeString();
        var timestamp_val = params_val.data.timestamp;
        var status_val = params_val.data.errorcode;

        //console.log('Adding resultData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_EVIDENCE, function (err, collection) {
            if (err) {
                throw err;
            } else {
                doc = { evidenceID: evidenceID_val, nodeID: nodeID_val, timestamp: timestamp_val, status: status_val, entrytime: new Date() };
                collection.insert(doc, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        //console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (addEvidence)：" + e);
    }
};

// リカバリスクリプトエビデンス記録
function addResultData( req, res ) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        if (params_val == null || Const.isNull(params_val.data)) {
            var msg = "There is no data in 'resultDataRecord'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        if (Const.isNull(params_val.nodeID)) {
            var msg = "There is no nodeID in 'resultDataRecord'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var nodeID_val = String(params_val.nodeID);

        var recoveryID_val = nodeID_val + Const.getUnixtimeString();
        var timestamp_val = params_val.data.timestamp;
        var name_val = params_val.data.name;
        var arguments_val = params_val.data.arguments;
        var errorcode_val = params_val.data.errorcode;
        var output_n_val = params_val.data.output_n;
        var output_e_val = params_val.data.output_e;

        //console.log('Adding resultData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RECOVERY, function (err, collection) {
            if (err) {
                throw err;
            } else {
                doc = { recoveryID: recoveryID_val, nodeID: nodeID_val, name: name_val, arguments: arguments_val, timestamp: timestamp_val, errorcode: errorcode_val, output: output_n_val, eoutput: output_e_val, entrytime: new Date() };
                collection.insert(doc, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        //console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (addResultData)：" + e);
    }
};

// rawアイテムマスタリストの取得
function getRawItemList(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;

        key = null;
        if (params_val != null) {
            key = params_val;
        };
        var order = { _id: -1 };      // -1:desc 1:asc

        //console.log('get raw_item list: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RAWITEM, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        //console.log(item_list);
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (getRawItemList)：" + e);
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

        //console.log('get preset list: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_PRESET, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0 }).sort(order).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        //console.log(item_list);
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { items: item_list }, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (getPresetList)：" + e);
    }
};

// モニタ情報リストの取得
function getMonitorList(req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;

       if (params_val==null || Const.isNull(params_val.nodeID)) {
            var msg = "There is no nodeID.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        };

        //console.log('get monitor list: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(params_val, { _id: 0 }).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else if(item_list.length==0) {
                        var msg = "There are no data of appointed nodeID. (" + params_val.nodeID +")";
                        console.log(msg);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INVALID_PARAMS , message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        //console.log(item_list);
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item_list, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (getMonitorList)：" + e);
    }
};

// モニタ情報の登録
function registMonitor(req, res) {
    try {
        var msg = "";
        var id_val = req.body.id;
        if (Const.isNull(req.body.params)) {
            msg = "There is no params in 'registMonitor'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var nodeID_val = req.body.params.nodeID;
        var name_val = req.body.params.name;
        var watchID_val = req.body.params.watchID;
        var presetID_val = req.body.params.presetID;
        var params_val = req.body.params.params;

        var msg = "";
        if (Const.isNull(nodeID_val)) {
            msg = "There is no nodeID in 'registMonitor'.";
        }
        else if (Const.isNull(watchID_val)) {
            msg = "There is no watchID in 'registMonitor'.";
        }
        else if (Const.isNull(presetID_val)) {
            msg = "There is no presetID in 'registMonitor'.";
        }
        else if (Const.isNull(name_val)) {
            msg = "There is no name in 'registMonitor'.";
        }
        else if (Const.isNull(params_val)) {
            msg = "There is no params.params in 'registMonitor'.";
        }
        if( msg !== "" ) {
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var nodeID_val = String(nodeID_val);        // 文字列型とする

        //console.log('regist Monitor: ' + JSON.stringify(req.body.params));
        db.collection(Const.DB_TABLE_PRESET, function (err, collection_p) {
            if (err) {
                throw err;
            } else {
                // paramNameのチェック
                collection_p.find({ presetID: presetID_val }).toArray(function (err, preset) {
                    if (err || preset.length == 0) {
                        msg = "There is no appointed presetID in Preset.";
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                        return;
                    } else {
                        var pName = preset[0].paramName;

                        async.each(pName, function (name, callback) {
                            name = name.replace(/\"/g, "");
                            //console.log("preset : params_val = " + JSON.stringify(params_val));
                            if (name in params_val) {
                                //console.log("preset : param = " + name);
                                callback();
                            } else {
                                msg = "There is no necessary param in params. (" + name + ")";
                                res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                                return;
                            }
                        }, function (err) {

                            // モニタの登録
                            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                                if (err) {
                                    throw err;
                                } else {
                                    collection.find({ nodeID: nodeID_val }).toArray(function (err, item_list) {
                                        if (item_list.length > 0) {
                                            msg = 'Error regist monitor: nodeID already exists. ';
                                            console.log(msg);
                                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                                        } else {
                                            data = { nodeID: nodeID_val, name: name_val, watchID: watchID_val, presetID: presetID_val, params: params_val };
                                            collection.insert(data, { safe: true }, function (err, result) {
                                                if (err) {
                                                    console.log('error: An error has occurred');
                                                    res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                                                } else {
                                                    //console.log('Success: ' + JSON.stringify(result[0]));
                                                    res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (registMonitor)：" + e);
    }
};

// モニタ情報の更新
function updateMonitor(req, res) {
    try {
        var msg = "";
        var id_val = req.body.id;
        if (Const.isNull(req.body.params)) {
            msg = "There is no params in 'updateMonitor'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var nodeID_val = req.body.params.nodeID;
        var name_val = req.body.params.name;
        var watchID_val = req.body.params.watchID;
        var presetID_val = req.body.params.presetID;
        var params_val = req.body.params.params;

        if (Const.isNull(nodeID_val)) {
            msg = "There is no nodeID in 'updateMonitor'.";
        }
        else if (Const.isNull(watchID_val)) {
            msg = "There is no watchID in 'updateMonitor'.";
        }
        else if (Const.isNull(presetID_val)) {
            msg = "There is no presetID in 'updateMonitor'.";
        }
        else if (Const.isNull(name_val)) {
            msg = "There is no name in 'updateMonitor'.";
        }
        else if (Const.isNull(params_val)) {
            msg = "There is no params.params in 'updateMonitor'.";
        }
        if( msg !== "" ) {
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var nodeID_val = String(nodeID_val);        // 文字列型とする

        //console.log('update Monitor: ' + JSON.stringify(req.body.params));
        db.collection(Const.DB_TABLE_PRESET, function (err, collection_p) {
            if (err) {
                throw err;
            } else {
                // paramNameのチェック
                collection_p.find({ presetID: presetID_val }).toArray(function (err, preset) {
                    if (err || preset.length == 0) {
                        msg = "There is no appointed presetID in Preset.";
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                        return;
                    } else {
                        var pName = preset[0].paramName;
                        async.each(pName, function (name, callback) {
                            name = name.replace(/\"/g, "");
                            //console.log("preset : params_val = " + JSON.stringify(params_val));
                            if (name in params_val) {
                                //console.log("preset : param = " + name);
                                callback();
                            } else {
                                msg = "There is no necessary param in params. (" + name + ")";
                                res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                                return;
                            }
                        }, function (err) {

                            // モニタの変更
                            db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
                                if (err) {
                                    throw err;
                                } else {
                                    key = { nodeID: nodeID_val };
                                    collection.findOne(key, function (err, item) {
                                        if (err) {
                                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                                        } else if (item == null) {
                                            var msg = "There are no data of appointed nodeID. (" + nodeID_val + ")";
                                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                                        } else {
                                            item.name = name_val;
                                            item.watchID = watchID_val;
                                            item.presetID = presetID_val;
                                            item.params = params_val;
                                            collection.update(key, item, { safe: true }, function (err, result) {
                                                if (err) {
                                                    console.log('Error updating monitor: ' + err);
                                                    res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                                                } else {
                                                    //console.log('Success: ' + JSON.stringify(result[0]));
                                                    res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                       });
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (updateMonitor)：" + e);
    }
};

// モニタ情報の削除
function deleteMonitor(req, res) {
    try {
        var id_val = req.body.id;
        if (req.body.params == null || Const.isNull(req.body.params.nodeID)) {
            msg  = "There is no nodeID in 'deleteMonitor'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var nodeID_val = String(req.body.params.nodeID);

        //console.log('delete Monitor: ' + JSON.stringify(req.body.params));
        db.collection(Const.DB_TABLE_MONITOR, function (err, collection) {
            if (err) {
                throw err;
            } else {
                key = { nodeID: nodeID_val };
                collection.remove(key, { safe: true }, function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        //console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: null, id: id_val }));
                    }
                });
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:Const.RPC_INTERNAL_ERROR , message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
        console.log("失敗 (deleteMonitor)：" + e);
    }
};
