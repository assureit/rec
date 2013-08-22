/**
 * New node file
 */
var url = require('url');
var http = require('http');

// コンストラクタ サンプル
function data() {
	this.name = "";
	this.arguments = null;
	this.timestamp = null;
	this.errorcode = 0;
	this.output_n = "";
	this.output_e = "";
}

function params() {
	this.nodeID = "";
	this.data = null;	// data()
}

function DataObj() {
	this.jsonrpc = "2.0",
	this.method = "resultDataRecord",
	this.params = null;	// params()
	this.id = 1;
}

// rawデータ記録API 汎用万能関数
// 実処理はこの関数のみに記載
exports.sendResultData = function(apiurl, nodeID, monitorName, args, timestamp, errorcode, output_n, output_e){
	// 送信データの定義
	var rawData = new DataObj();
	rawData.params = new params();
	rawData.params.nodeID = nodeID;
	rawData.params.data = new data();
	rawData.params.data.name = monitorName;
	rawData.params.data.arguments = args;
	rawData.params.data.timestamp = timestamp;
	rawData.params.data.errorcode = errorcode;
	rawData.params.data.output_n = output_n;
	rawData.params.data.output_e = output_e;
	
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

