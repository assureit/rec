
/**
 * Module dependencies.
 */

var express = require('express')
  , recPost = require('./routes/recPostData')
  , wRegularly = require('./routes/watchRegularly')
  , webRawData = require('./routes/webRawData')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , Const = require('./public/const')
  , mongo = require('mongodb')
  , cron = require('cron');

var app = exports.app = express();      // add for test

app.configure(function(){
  app.set('port', process.env.PORT || 3001);      // 本番サーバのとき
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(err, req, res, next){
    console.log('▲▲ system error ' + err + '(' + err.status + ')');
    //if(err.status == '400'){
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:err.status , message: String(err) }, id: 0 }), err.status)
    //} else {
        //next(err)
    //}
    })
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// rec API
app.post(Const.SITE, recPost.getJsonData);

// WEB list
app.get(Const.SITE, webRawData.list);
app.get(Const.SITE+'rawDataList', webRawData.list);
// WEB download
app.post(Const.SITE+'rawDataList', webRawData.download);


// watch regularly
var cronTime = "*/" + Const.WATCH_INTERVAL + " * * * *";   // every 5 minutes
job = new cron.CronJob({
    cronTime: cronTime

    , onTick: function() {
        //console.log("▼ run " + Const.getDateString());
        wRegularly.watchRawData();
    }
    , start: false
    //, timeZone: "Japan/Tokyo"
})

// open mongo DB
db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
db.open(function (err, db) {
    if (!err) {
        console.log('----- open mongoDB. -----');
        
        // 以下定期処理実行を行う場合コメントアウト
        //job.start();
        //console.log('----- start job : ' + cronTime);
    }
});

//if (!module.parent) {      // add for test
    http.createServer(app).listen(app.get('port'), function () {
        console.log("----- Express server listening on port " + app.get('port'));
    });
//}
