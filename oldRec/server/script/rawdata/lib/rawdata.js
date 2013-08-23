/**
 * New node file
 */
var url = require('url');
var http = require('http');

// コンストラクタ サンプル
function data() {
	this.name = "";
	this.num = 0;
	this.timestamp = null;
}

function params() {
	this.watchID = "";
	this.data = null;	// data()
	this.priority = 0;
}

function DataObj() {
	this.jsonrpc = "2.0",
	this.method = "rawDataRecord",
	this.params = null;	// params()
	this.id = 1;
}

// rawデータ記録API 通常利用
exports.sendSingleRawData = function(apiurl, watchID, name, param) {
//	console.log("Call sendSingleRawData([" + apiurl + "], [" + watchID + "], [" + name + "], [" + param + "])");
	var dataobj = new data();
	dataobj.name = name;
	dataobj.num = param;
	dataobj.timestamp = new Date();
	sendSingleRawDataWithPriority(apiurl, watchID, dataobj, 0);
};

// rawデータ記録API 通常利用（緊急時の送信用）
exports.sendSingleRawDataTooHurry = function(apiurl, watchID, name, param){
	var dataobj = new data();
	dataobj.name = name;
	dataobj.num = param;
	dataobj.timestamp = new Date();
	sendSingleRawDataWithPriority(apiurl, watchID, dataobj, 255);
};

// rawデータ記録API 複数の結果を一括して送信
exports.sendRawsData = function(apiurl, watchID, dataarray){
	for (var dataobj in dataarray) {
		sendSingleRawDataWithPriority(apiurl, watchID, dataobj, 0);
	}
};

// rawデータ記録API 汎用万能関数
// 実処理はこの関数のみに記載
sendSingleRawDataWithPriority = function(apiurl, watchID, dataobj, priority){
	// 送信データの定義
	var rawData = new DataObj();
	rawData.params = new params();
	rawData.params.watchID = watchID;
	rawData.params.data = new Array(1);
	rawData.params.data[0] = dataobj;
	rawData.params.priority = priority;
	
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
			var jsondata = JSON.stringify(rawData);
//			console.log(jsondata);
			req.write(jsondata);
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

