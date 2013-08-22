#! /usr/bin/node
// タイプ２
// Zabbixエージェントから現在の情報を直接取得してRECサーバに情報を送信するサンプル
var reclib = require('./lib/rawdata');
var exec = require('child_process').exec,
child;

// 固定変数、
var recURL = "http://127.0.0.1/rec/api/2.0/";
var location = 'AssureIt Server';
var type = 'CPU Idol';

// RECサーバのエージェントに情報を要求
child = exec('zabbix_get -s54.250.206.119 -p10050 -k system.cpu.util[,idle]', function(err, stdout, stderr) {
  if (err != null) {
    console.log("error : " + err);
  } else {
    var rawdata = stdout.replace(/\n/g, "");
    reclib.pushRawData(recURL, location, type, rawdata);
//    console.log("result : " + stdout);
  }
});
