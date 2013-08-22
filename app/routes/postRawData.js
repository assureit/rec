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
        if (Const.isNull(data_val) || isNaN(data_val) ) {
            var msg = "There is no data in 'pushRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var timestamp_val = params_val.timestamp;
        if (Const.isNull(timestamp_val)) {
           timestamp_val = Const.getIsoDateString();
        }
        var context_val = params_val.context;

        //console.log('Adding rawData: ' + JSON.stringify(params_val));
        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                doc = { location: location_val, type: type_val, data: data_val, timestamp: timestamp_val, context: context_val, entrytime: new Date() };
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
        var key = getRawDataSortKey(params_val);
        var p_limit = params_val.limit;
        var p_datatype = params_val.datatype;
        if (Const.isNull(p_datatype)) {
            p_datatype = "ave"
        }

        //console.log("key=" + JSON.stringify(key));
        var order = { _id: -1 };      // -1:desc 1:asc

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0, entrytime: 0 }).sort(order).limit(p_limit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        var data_val = getCalculateData(item_list, p_datatype);
                        if (data_val == null) {
                            msg = "error: An error has occurred : datatype=" + p_datatype;
                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_METHOD_NOT_FOUND, message: msg }, id: id_val }), Const.HTTP_STATUS_NOT_FOUND);
                            return;
                        }
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { data: data_val }, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getRawData)：" + e);
    }
};

// 指定rawデータの確認API
exports.checkRawData = function (req, res) {
    try {

        var id_val = req.body.id;
        var params_val = req.body.params;
        var key = getRawDataSortKey(params_val);
        var p_limit = params_val.limit;
        var p_datatype = params_val.datatype;
        if (Const.isNull(p_datatype)) {
            p_datatype = "ave"
        }
        var check_val = params_val.check;
        if (Const.isNull(check_val)) {
            var msg = "There is no check in 'checkRawData'.";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        // check項目の分割
        var check_arr = check_val.replace(/[\t\r\n\s]+/g, " ").replace(/(^\s+|\s+$)/g, "").split(" ");
        if (check_arr.length != 2) {
            var msg = "A value of check is abnormal. 'checkRawData'. [" + check_val + "]";
            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INVALID_PARAMS, message: msg }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
            return;
        }
        var order = { _id: -1 };      // -1:desc 1:asc

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0, entrytime: 0 }).sort(order).limit(p_limit).toArray(function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        var data_val = getCalculateData(item_list, p_datatype);
                        if (data_val == null) {
                            msg = "error: An error has occurred : datatype=" + p_datatype;
                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_METHOD_NOT_FOUND, message: msg }, id: id_val }), Const.HTTP_STATUS_NOT_FOUND);
                            return;
                        }

                        console.log("data_val：" + data_val);
                        var ret_val = false;
                        if (check_arr[0] == "gt") {            // より大きい ＞
                            if (data_val > Number(check_arr[1])) {
                                ret_val = true;
                            }
                        } else if (check_arr[0] == "lt") {     // より小さい ＜
                            if (data_val < Number(check_arr[1])) {
                                ret_val = true;
                            }
                        } else if (check_arr[0] == "gte") {    // 以上 ≧
                            if (data_val >= Number(check_arr[1])) {
                                ret_val = true;
                            }
                        } else if (check_arr[0] == "lte") {    // 以下 ≦
                            if (data_val <= Number(check_arr[1])) {
                                ret_val = true;
                            }
                        } else if (check_arr[0] == "eq") {     // 等しい ＝
                            if (data_val == Number(check_arr[1])) {
                                ret_val = true;
                            }
                        } else if (check_arr[0] == "neq") {    // 等しくない ≠
                            if (data_val != Number(check_arr[1])) {
                                ret_val = true;
                            }
                        } else {
                            msg = "error: An error has occurred : check=" + check_val;
                            res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_METHOD_NOT_FOUND, message: msg }, id: id_val }), Const.HTTP_STATUS_NOT_FOUND);
                            return;
                        }

                        res.send(JSON.stringify({ jsonrpc: "2.0", result: { "return": ret_val }, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (checkRawData)：" + e);
    }
};

// 指定rawデータリストの取得API
exports.getRawDataList = function (req, res) {
    try {

        var id_val = req.body.id;
        var params_val = req.body.params;
        var key = getRawDataSortKey(params_val);
        var p_limit = params_val.limit;

        //console.log("key=" + JSON.stringify(key));
        var order = { _id: -1 };      // -1:desc 1:asc

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.find(key, { _id: 0, entrytime: 0 }).sort(order).limit(p_limit).toArray(function (err, item_list) {
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

// locationデータ一覧の取得API
exports.getLocation = function (req, res) {
    try {
        var id_val = req.body.id;

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                //collection.group(['location'], {}, {}, "function(doc, prev){}", true, function (err, item_list) {
                collection.distinct('location', function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        //console.log(item_list);
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item_list, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getLocation)：" + e);
    }

};

// typeデータ一覧の取得API
exports.getType = function (req, res) {
    try {
        var id_val = req.body.id;

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                //collection.group(['type'], {}, {}, "function(doc, prev){}", true, function (err, item_list) {
                collection.distinct('type', function (err, item_list) {
                    if (err) {
                        console.log('error: An error has occurred :' + err);
                        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: err }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
                    } else {
                        //console.log(item_list);
                        res.send(JSON.stringify({ jsonrpc: "2.0", result: item_list, id: id_val }));
                    }
                });
            }
        });

    } catch (e) {
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code: Const.RPC_INTERNAL_ERROR, message: String(e) }, id: id_val }), Const.HTTP_STATUS_SERVER_ERROR);
        console.log("失敗 (getType)：" + e);
    }

};

// locationとtypeの組み合わせ一覧の取得API
exports.getLocationAndType = function (req, res) {
    try {
        var id_val = req.body.id;

        db.collection(Const.DB_TABLE_RAWDATA, function (err, collection) {
            if (err) {
                throw err;
            } else {
                collection.group(['location', 'type'], {}, {}, "function(doc, prev){}", true, function (err, item_list) {
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
        console.log("失敗 (getLocationAndType)：" + e);
    }

};

// DB検索キーの取得
// 戻り値：rawDataテーブルの検索キー
function　getRawDataSortKey(params_val) {
    var p_location = params_val.location;
    var p_type = params_val.type;
    var p_count = params_val.count;
    var key = null;

    if (Const.isNull(p_count)) {
        if (Const.isNull(p_location)) {
            if (Const.isNull(p_type)) {
                key = null;
            } else {
                key = { type: p_type };
            }
        } else {
            if (Const.isNull(p_type)) {
                key = { location: p_location };
            } else {
                key = { location: p_location, type: p_type };
            }
        }            
    } else {
        var sortTime = new Date();
        sortTime.setMilliseconds(0);
        sortTime.setTime(sortTime.getTime() - (1000 * p_count));     // p_count秒前から検索
        if (Const.isNull(p_location)) {
            if (Const.isNull(p_type)) {
                key = { entrytime: { $gt: sortTime} };
            } else {
                key = { type: p_type, entrytime: { $gt: sortTime} };
            }
        } else {
            if (Const.isNull(p_type)) {
                key = { location: p_location, entrytime: { $gt: sortTime} };
            } else {
                key = { location: p_location, type: p_type, entrytime: { $gt: sortTime} };
            }
        }
    }

    return key;
}

// datatypeによる取得一覧の集計
// 戻り値：計算結果　エラー時=null データなし=NaN
function　getCalculateData(item_list,p_datatype) {
    var caldata=null;
    var tmpdata;
    var count = item_list.length;

    try {
        if( count>0 ) {
            caldata = Number(item_list[0].data);
        } else {
            caldata = NaN;
        }
        if (p_datatype == "max") {          // 最大値
            for (var i = 1; i < count; i++) {
                tmpdata = Number(item_list[i].data);
                if( caldata<tmpdata ) {
                    caldata = tmpdata ;
                }
            }
        } else if (p_datatype == "min") {   // 最小値
            for (var i = 1; i < count; i++) {
                tmpdata = Number(item_list[i].data);
                if( caldata>tmpdata ) {
                    caldata = tmpdata ;
                }
            }
        } else if (p_datatype == "ave") {   // 平均
            for (var i = 1; i < count; i++) {
                caldata += Number(item_list[i].data);
            }
            if (!isNaN(caldata)) {
                caldata /= count;
            }
        } else {                            // その他？
            caldata = null;
        }

        return caldata;

    } catch (e) {
        console.log("失敗 (getCalculateData)：" + e);
        return null;
    }
}

