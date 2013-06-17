// データベース接続設定
exports.DB_NAME = 'konohadb';
exports.DB_IP   = 'localhost';
exports.DB_PORT = 27017;

// テーブル名
exports.DB_TABLE_RAWDATA = 'raw_data';
exports.DB_TABLE_RAWITEM = 'raw_item';
exports.DB_TABLE_MONITOR = 'monitor';
exports.DB_TABLE_PRESET = 'preset';
exports.DB_TABLE_EVIDENCE = 'evidence';

// WEB表示
exports.LIST_LIMIT = 20;

// rawID等の取得 ID+YYYYMMDDHH24MISS
exports.getRawID = function(watchID) {
    return new String(watchID) + getDateString();
};
// 日付文字列の取得 [YYYYMMDDHH24MISS]
exports.getDateString = function() {
    return "wwwwwwwwwwwwwwww";
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
    console.log('dateStr : ' + dateStr);
    return dateStr;
};