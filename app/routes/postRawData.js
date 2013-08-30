var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var Const = require('../public/const');
var fs = require('fs');

//---------------------------------
// post rawデータ用
//---------------------------------

// rawデータ記録API
exports.pushRawData = function (req, res) {
    try {
        var id_val = req.body.id;
        var params_val = req.body.params;
        if (params_val == null) {
            var msg = "There is no data in 'pushRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }

        // params check
        var location_val = params_val.location;
        if (Const.isNull(location_val)) {
            var msg = "There is no location in 'pushRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var type_val = params_val.type;
        if (Const.isNull(type_val)) {
            var msg = "There is no type in 'pushRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var data_val = Number(params_val.data);
        //console.log('data_val: ' + data_val);
        if (isNaN(data_val) ) {
            var msg = "There is no data in 'pushRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var authid_val = params_val.authid;
        //console.log('authid_val: ' + data_val);
        if (Const.isNull(authid_val)) {
            var msg = "There is no authid in 'pushRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var timestamp_val = new Date();
        var timestamp_str = params_val.timestamp;
        if (!Const.isNull(timestamp_str)) {
            try {
                timestamp_val = new Date(timestamp_str);
            } catch (e) {
                var msg = "timestamp string is abnormal. in 'pushRawData'.";
                res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                return;
            }
        }
        var context_val = params_val.context;
        var recID_val = Const.getUnixtimeString();

        //console.log('Adding rawData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                doc = { recid: recID_val, location: location_val, type: type_val, authid: authid_val, data: data_val, timestamp: timestamp_val, context: context_val };
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
            }
        });
    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (pushRawData)：" + e);
    }

};

// 指定rawデータの取得API
exports.getRawData = function (req, res) {
    try {

        var id_val = req.body.id;
        var params_val = req.body.params;
        // params check
        var recid_val = params_val.recid;
        if (Const.isNull(recid_val)) {
            var msg = "There is no recid in 'getRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var key = { recid: recid_val };

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.findOne(key, { _id: 0 }, function (err, item) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else if (item == null) {
                        var msg = "There are no data of appointed recid. (" + recid_val + ")";
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR)
                    } else {
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getRawData)：" + e);
    }
};

// 最新rawデータの取得API
exports.getLatestData = function (req, res) {
    try {

        var id_val = req.body.id;
        var params_val = req.body.params;
        // params check
        var location_val = params_val.location;
        if (Const.isNull(location_val)) {
            var msg = "There is no location in 'getLatestData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var type_val = params_val.type;
        if (Const.isNull(type_val)) {
            var msg = "There is no type in 'getLatestData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var key = { location: location_val, type: type_val };
        //console.log("key=" + JSON.stringify(key));
        var order = { timestamp: -1 };      // -1:desc 1:asc

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id:0 }).sort(order).limit(1).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item_list[0], id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getLatestData)：" + e);
    }
};

// 指定rawデータリストの取得API
exports.getRawDataList = function (req, res) {
    try {

        var id_val = req.body.id;
        var params_val = req.body.params;
        var key = getRawDataSortKey(params_val);
        var p_limit = params_val.limit;
        var sort_val = params_val.sort;

        //console.log("key=" + JSON.stringify(key));
        var order = { timestamp: -1 };      // -1:desc 1:asc

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0 }).sort(order).limit(p_limit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        //console.log(item_list);
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { list: item_list }, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getRawDataList)：" + e);
    }

};


// Monitor情報一覧の取得API
exports.getMonitorList = function (req, res) {
    try {
        var id_val = req.body.id;

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.group(['location', 'type'], {}, {'beginTimestamp':0, 'latestTimestamp':0, 'authid':'', 'count':0}, getMinMaxForGroup, true, function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item_list, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getMonitorList)：" + e);
    }

};

// DBのgroup取得時に呼び出す、timestampの最大最少を求める関数
function getMinMaxForGroup(obj, prev) {
    if(prev.count==0) {
        prev.beginTimestamp = obj.timestamp;
        prev.latestTimestamp = obj.timestamp;
    }

    if(prev.beginTimestamp > obj.timestamp) {
        prev.beginTimestamp = obj.timestamp; 
    }
    if(prev.latestTimestamp < obj.timestamp) {
        prev.latestTimestamp = obj.timestamp; 
    }

    prev.authid = obj.authid;
    prev.count++;
};

// DB検索キーの取得
// 戻り値：rawDataテーブルの検索キー
function　getRawDataSortKey(params_val) {
    var p_location = params_val.location;
    var p_type = params_val.type;
    var p_beginTime = params_val.beginTimestamp;
    var p_endTime = params_val.endTimestamp;
    var key = {};

    // Location : 位置情報(サーバ情報)
    if (!Const.isNull(p_location)) {
        key.location = {$in : p_location};
    }

    // Type : 情報種別
    if (!Const.isNull(p_type)) {
        key.type = {$in : p_type };
    }

    // entrytime     : 登録時刻
    if (!Const.isNull(p_beginTime) || !Const.isNull(p_endTime)) {
        if (Const.isNull(p_beginTime)) {
            // ケース１：endTimestampのみ指定
            var end_time = new Date(p_endTime);
            key.timestamp = {$lte: end_time};
        } else if (Const.isNull(p_endTime)) {
            // ケース１：beginTimestampのみ指定
            var begin_time = new Date(p_beginTime);
            key.timestamp = {$gt: begin_time};
        } else {
            // ケース３：beginTimestamp、endTimestamp双方指定
            var begin_time = new Date(p_beginTime);
            var end_time = new Date(p_endTime);
            key.timestamp = {$gt: begin_time, $lte: end_time};
        }
    }

    console.log(JSON.stringify(key));
    return key;
}
