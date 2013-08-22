/**
 * New node file
 */
var url = require('url');
var http = require('http');

// コンストラクタ サンプル
function params() {
	this.location = "";
	this.type = "";
	this.data = 0;
}

function DataObj() {
	this.jsonrpc = "2.0",
	this.method = "pushRawData",
	this.params = null;	// params()
	this.id = 1;
}

// rawデータ記録API 通常利用
exports.pushRawData = function(apiurl, location, type, data) {
	var dataobj = new params();
	dataobj.location = location;
	dataobj.type = type;
	dataobj.data = data;
	pushRawDataObj(apiurl, dataobj);
};

// rawデータ記録API 通常利用（時刻情報付き）
exports.pushRawDataWithDate = function(apiurl, location, type, data){
	var dataobj = new params();
	dataobj.location = location;
	dataobj.type = type;
	dataobj.data = data;
	dataobj.timestamp = new Date();
	pushRawDataObj(apiurl, dataobj);
};

// rawデータ記録API 通常利用（付帯情報付き）
exports.pushRawDataWithContext = function(apiurl, location, type, data, context){
	var dataobj = new params();
	dataobj.location = location;
	dataobj.type = type;
	dataobj.data = data;
	dataobj.context = context;
	pushRawDataObj(apiurl, dataobj);
};

// rawデータ記録API 通常利用（時刻情報・付帯情報付き）
exports.pushRawDataWithDateAndContext = function(apiurl, location, type, data, context){
	var dataobj = new params();
	dataobj.location = location;
	dataobj.type = type;
	dataobj.data = data;
	dataobj.timestamp = new Date();
	dataobj.context = context;
	pushRawDataObj(apiurl, dataobj);
};

// rawデータ記録API 汎用万能関数
// 実処理はこの関数のみに記載
pushRawDataObj = function(apiurl, dataobj){
	// 送信データの定義
	var rawData = new DataObj();
	rawData.params = dataobj;
	
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

