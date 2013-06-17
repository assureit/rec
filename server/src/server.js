
/**
 * Module dependencies.
 */

var express = require('express')
  , recPost = require('./routes/recPostData')
  , wRegularly = require('./public/watchRegularly')
  , web = require('./routes/webService')
  , http = require('http')
  , url = require('url')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/', recPost.getJsonData);
app.get('/', web.rawData.list);

// WEB list
app.get('/rawDataList', web.rawData.list);
app.get('/rawItemList', web.rawItem.list);
app.get('/monitorlist', web.monitor.list);
app.get('/presetlist', web.preset.list);
app.get('/evidencelist', web.evidence.list);
// WEB download
app.post('/rawDataList', web.rawData.download);
app.post('/rawItemList', web.rawItem.download);
app.post('/monitorlist', web.monitor.download);
app.post('/presetlist', web.preset.download);
app.post('/evidencelist', web.evidence.download);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

