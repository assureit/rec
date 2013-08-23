#! /usr/bin/node
// タイプ２
// Zabbixエージェントから現在の情報を直接取得してRECサーバに情報を送信するサンプル
var reclib = require('./lib/rawdata');
var exec = require('child_process').exec,
child;

// 固定変数、
var recURL = "http://127.0.0.1/rec/api/1.0/";
var watchID = 'REC_DiskFreePer';	// RECサーバに送信するwatchID
var watchName = 'Zabbix Server Disk read statistics';	// RECサーバに送信するパラメータ説明

// RECサーバのエージェントに情報を要求
child = exec('zabbix_get -s54.250.133.227 -p10050 -k vfs.fs.size[/,pfree]', function(err, stdout, stderr) {
  if (err != null) {
    console.log("error : " + err);
  } else {
    var rawdata = stdout.replace(/\n/g, "");
    reclib.sendSingleRawData(recURL, watchID, watchName, rawdata);
//    console.log("result : " + stdout);
  }
});
