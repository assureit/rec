
/**
 * Module dependencies.
 */

var express = require('express')
  , recPost = require('./routes/recPostData')
  , wRegularly = require('./routes/watchRegularly')
  , web = require('./routes/webService')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , Const = require('./public/const')
  , mongo = require('mongodb')
  , cron = require('cron');

var app = exports.app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
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
        // とりあえず、こちらの書式で返す。
        res.contentType('application/json');
        res.send(JSON.stringify({ jsonrpc: "2.0", error: { code:err.status , message: String(err) }, id: 0, status:err.status }))
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
app.get(Const.SITE, web.monitor.list);
app.get(Const.SITE+'rawDataList', web.rawData.list);
app.get(Const.SITE+'rawItemList', web.rawItem.list);
app.get(Const.SITE+'monitorlist', web.monitor.list);
app.get(Const.SITE+'presetlist', web.preset.list);
app.get(Const.SITE+'evidencelist', web.evidence.list);
app.get(Const.SITE+'recoveryevilist', web.recoveryevi.list);
// WEB download
app.post(Const.SITE+'rawDataList', web.rawData.download);
app.post(Const.SITE+'rawItemList', web.rawItem.download);
app.post(Const.SITE+'monitorlist', web.monitor.download);
app.post(Const.SITE+'presetlist', web.preset.download);
app.post(Const.SITE+'evidencelist', web.evidence.download);
app.post(Const.SITE+'recoveryevilist', web.recoveryevi.download);
// edit data
app.post(Const.SITE+'rawItemEdit', web.rawItem.edit);
app.post(Const.SITE+'monitorEdit', web.monitor.edit);
app.post(Const.SITE+'presetEdit', web.preset.edit);

// watch regularly
var cronTime = "*/" + Const.WATCH_INTERVAL + " * * * *";   // every 5 minutes
job = new cron.CronJob({
    cronTime: cronTime

    , onTick: function() {
        //console.log("▼ run " + Const.getDateString());
        wRegularly.watchMonitor();
        wRegularly.watchRawDataByPriority();
    }
    , start: false
    //, timeZone: "Japan/Tokyo"
})

// open mongo DB
db = new mongo.Db(Const.DB_NAME, new mongo.Server(Const.DB_IP, Const.DB_PORT), {safe:false});
db.open(function (err, db) {
    if (!err) {
        console.log('----- open mongoDB. -----');
        job.start();
        console.log('----- start job : ' + cronTime);
    }
});

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function(){
        console.log("----- Express server listening on port " + app.get('port'));
    });
}
