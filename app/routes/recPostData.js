var mongo = require('mongodb');
var async = require('async');
var Const = require('../public/const');
var rawData = require('./postRawData');

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

        if (method_val == "pushRawData") {
            // rawデータ記録API
            rawData.pushRawData(req, res);
        } else if (method_val == "getRawData") {
            // 指定rawデータの取得
            rawData.getRawData(req, res);
        } else if (method_val == "checkRawData") {
            // 指定rawデータの比較
            rawData.checkRawData(req, res);
        } else if (method_val == "getRawDataList") {
            // 指定rawデータリストの取得
            rawData.getRawDataList(req, res);
        } else if (method_val == "getLocationList") {
            // locationデータ一覧の取得
            rawData.getLocation(req, res);
        } else if (method_val == "getTypeList") {
            // typeデータ一覧の取得
            rawData.getType(req, res);
        } else if (method_val == "getLocationAndTypeList") {
            // locationとtypeの組み合わせ一覧の取得
            rawData.getLocationAndType(req, res);
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

