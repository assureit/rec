// 各種モジュールの読み込み
var fs = require('fs');
var sys = require('sys');
var http = require('http');
var url = require('url');
var moment = require('./moment');

var dataObj = {
	jsonrpc:"2.0",
	method:"rawDataSend",
	params: {
		watchID: "sampleID",
		data: {
			name: "ServerA CPU",
			num: 0,
			timestamp: ""
		}
	},
	id: 1
};
dataObj.params.data.timestamp = moment.format();

var apiURL = "http://localhost/rec/api/1.0/";
 
// 対象データの読み取り
readRawData();
 
// 対象データの読み取り関数
function readRawData() {
    // 別途ユーザーが用意した、この関数の主題となるデータを取得
    // 各URLに対してリクエストを投げる
    sendRawData(apiURL);
}
 
// rawデータの送信関数
function sendRawData(target_url) {
	// URLをパース
	var parsed_url = url.parse(target_url);

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
			req.write(dataObj);
			req.end();
		});
	});
    
    // レスポンスイベントハンドラ
    req.on('response', function (response) {
        // データ取得完了ハンドラ
        response.on('end', function(){
            // URLとステータスを出力
            console.log(target_url+" - "+response.statusCode);
        })
    });
}
