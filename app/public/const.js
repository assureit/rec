// データベース接続設定
exports.DB_NAME = 'konohadb2';
exports.DB_IP   = 'localhost';
exports.DB_PORT = 27017;

// テーブル名
exports.DB_TABLE_RAWDATA = 'raw_data';

// WEB表示
exports.LIST_LIMIT = 40;
exports.SITE = '/api/2.0/';

exports.WATCH_INTERVAL = 1;     // minutes


// HTTPエラー
exports.HTTP_STATUS_BAD_REQUEST = 400;
exports.HTTP_STATUS_NOT_FOUND = 404;
exports.HTTP_STATUS_SERVER_ERROR = 500;

// RPCエラー
exports.RPC_INVALID_REQUEST = -32600;
exports.RPC_METHOD_NOT_FOUND = -32601;
exports.RPC_INVALID_PARAMS = -32602;
exports.RPC_INTERNAL_ERROR = -32603;

// 日付文字列の取得 [YYYYMMDDHH24MISS]
exports.getDateString = function() {
    var date = new Date();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();
    var s = date.getSeconds();

    if (m < 10) m = '0' + m;
    if (d < 10) d = '0' + d;
    if (h < 10) h = '0' + h;
    if (mi < 10) mi = '0' + mi;
    if (s < 10) s = '0' + s;
    var dateStr = date.getFullYear() + m + d + h + mi + s;
    return dateStr;
};

// 日付文字列の取得 [unixtime]
exports.getUnixtimeString = function() {
    var dateStr = Math.floor(new Date/1000);
    return String(dateStr);
};

// 日時文字列(ISO8601)の取得
exports.getIsoDateString = function() {
    var date = new Date();
    var m = date.getUTCMonth() + 1;
    var d = date.getUTCDate();
    var h = date.getUTCHours();
    var mi = date.getUTCMinutes();
    var s = date.getUTCSeconds();

    if (m < 10) m = '0' + m;
    if (d < 10) d = '0' + d;
    if (h < 10) h = '0' + h;
    if (mi < 10) mi = '0' + mi;
    if (s < 10) s = '0' + s;

    var dateStr = date.getFullYear() + '-' + m + '-' + d + 'T' + h + ':' + mi + ':' + s + 'Z';
    return dateStr;
};

// nullの確認
exports.isNull = function (in_object) {
    if (in_object == null || in_object == undefined || in_object == "") {
        return true;
    }
    return false;
};

// JSON形式の確認
exports.isJson = function (in_object) {
    if (in_object == null || in_object == undefined || in_object == "") {
        return false ;
    }
    in_object = (typeof (in_object) == "function") ? in_object() : in_object;
    if (typeof (in_object) != "string") {
        return false;
    }

    try {
        in_object = (!JSON) ? eval("(" + in_object + ")") : JSON.parse(in_object); return true;
    } catch (e) {
        return false;
    }
    return false;
};