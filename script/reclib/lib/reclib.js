/**
 * New node file
 */
var url = require('url');

// コンストラクタ サンプル
var RecLib = function(apiurl){
	this.apiurl = apiurl;
};

function data() {
	this.name = "";
	this.num = 0;
	this.timestamp = null;
}

function params() {
	this.watchID = "";
	this.data = null;	// data()
}

function dataObj() {
	this.jsonrpc = "2.0",
	this.method = "rawDataSend",
	this.params = null;	// params()
	this.id = 1;
}

// rawデータ記録API 通常利用
RecLib.prototype.sendSingleRawData = function(watchID, name, param){
	var dataobj = new data();
	dataobj.name = name;
	dataobj.num = param;
	dataobj.timestamp = new Date();
	sendSingleRawDataWithPriority(watchID, dataobj, 0);
};

// rawデータ記録API 通常利用（緊急時の送信用）
RecLib.prototype.sendSingleRawDataTooHurry = function(watchID, name, param){
	var dataobj = new data();
	dataobj.name = name;
	dataobj.num = param;
	dataobj.timestamp = new Date();
	sendSingleRawDataWithPriority(watchID, dataobj, 255);
};

// rawデータ記録API 複数の結果を一括して送信
RecLib.prototype.sendSingleRawData = function(watchID, dataarray){
	for (var dataobj in dataarray) {
		sendSingleRawDataWithPriority(watchID, dataobj, 0);
	}
};

// rawデータ記録API 汎用万能関数
// 実処理はこの関数のみに記載
RecLib.prototype.sendSingleRawDataWithPriority = function(watchID, dataobj, priority){
	// 送信データの定義
	var rawData = new dataObj();
	rawData.params.watchID = watchID;
	rawData.params.data = dataobj;
	
	// URLをパース
	var parsed_url = url.parse(apiurl);

	// HTTPリクエスト用オプションの用意
	var options = {
		hostname: parsed_url.hostname,
		port: 80,
		path: parsed_url.path,
		method: 'POST',
		headers: { 'content-type': "application/json" }
	};

	// HTTPクライアントを生成
	var req = http.request(options);
	req.on('socket', function(socket) {
		socket.on('connect', function() {
			req.write(json.stringify(dataObj));
			req.end();
		});
	});
    
    // レスポンスイベントハンドラ
    req.on('response', function (response) {
        // データ取得完了ハンドラ
        response.on('end', function(){
            // URLとステータスを出力
            // console.log(target_url+" - "+response.statusCode);
        });
    });

    return;
};

module.exports = RecLib;