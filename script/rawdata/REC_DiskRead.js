#! /usr/bin/node
// タイプ１
// Zabbixから情報を取得してRECサーバに情報を送信するサンプル
var mysql = require('mysql');
var reclib = require('./lib/rawdata');

var connection = mysql.createConnection({
  host     : 'localhost', //接続先ホスト。Zabbixの場合はzabbix_server.confのDBHost
  user     : 'zabbix',      //ユーザー名。同DBUser
  password : 'SiJ7bGx5',  //パスワード。同DBPassword
  database : 'zabbix'    //DB名。同DBName
});

// 固定変数、
var recURL = "http://127.0.0.1/rec/api/1.0/";
var watchID = 'REC_DiskRead';	// RECサーバに送信するwatchID
var watchName = 'Zabbix Server Disk read statistics(sectors/sec)';	// RECサーバに送信するパラメータ説明
var itemId = '23335';	// 実際に検索時に使用するItemID
var sql = 'select from_unixtime(clock) as jobtime, value from history_uint where itemid = ? order by jobtime desc limit 2;';	// データ取得用SQL。ケースごとの変更不要。

// MySQLに接続
connection.connect();

// プレースホルダを使用してSQL発行
var query = connection.query(sql, [itemId], function(err, results) {
  if(err) {
    console.log('err is: ', err );
  }

  var senddata = (results[0].value - results[1].value) / 60;
  reclib.sendSingleRawData(recURL, watchID, watchName, senddata);
  connection.destroy(); //終了
});
