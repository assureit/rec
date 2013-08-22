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
var watchID = 'serverA_CPU';	// RECサーバに送信するwatchID
var watchName = 'Zabbix Server CPU Idol';	// RECサーバに送信するパラメータ説明
var itemId = '23299';	// 実際に検索時に使用するItemID
var sql = 'select from_unixtime(clock) as jobtime, value from history where itemid=? order by jobtime desc limit 1;';	// データ取得用SQL。ケースごとの変更不要。

// MySQLに接続
connection.connect();

// プレースホルダを使用してSQL発行
var query = connection.query(sql, [itemId]);

// SQL実行後は、各イベントをもとに処理を行う
query
  // エラー
  .on('error', function(err) {
    console.log('err is: ', err );
  })

  // 結果(実際の処理を行う部分)
  // 受け取ったデータはJSON形式で格納されている。
  .on('result', function(rows) {
    var senddata = rows.value;
    reclib.sendSingleRawData(recURL, watchID, watchName, senddata);
  })

  // DB接続終了
  .on('end', function() {
    connection.destroy(); //終了
  });
  
