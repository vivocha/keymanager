
var express = require('express');
var http = require('http');
var crypto = require('crypto');

// Put here your Vivocha Account secret token (you can find it in Settings->Security). Must be a 96 bytes hex string.
var secret = '47242e604a74ea7854787a14ac1afaf438aeb56a7c471ba3b3269731819a3d80de339f4a3d3b5b920d16d2d4dde1ac2d';

var fakeKey = 'babababababababababababababababa' +                                // fake IV     (128 bits as 32 bytes hex string)
              'cacacacacacacacacacacacacacacacacacacacacacacacacacacacacacacaca'; // fake key    (256 bits as 64 bytes hex string)

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('ip', process.env.IP || '127.0.0.1');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function encrypt(_key, _data) {
  if (_key.length != (128 + 256) / 8 * 2) throw new Error('invalid_key');
  var iv = new Buffer(_key.substr(0, 128 / 8 * 2), 'hex');
  var key = new Buffer(_key.substr(128 / 8 * 2), 'hex');

  var data = crypto.randomBytes(8).toString('hex') + _data;

  var e = crypto.createCipheriv('AES256', key, iv);
  var c = e.update(data, 'utf8', 'base64');
  c += e.final('base64');
  return c;
}

function createKey(id, copyFrom) {
  if (copyFrom) {
    console.log('copy key of contact ' + copyFrom + ' to contact ' + id);
  } else {
    console.log('creating key for contact ' + id );
  }
  return fakeKey;
}
function getKey(id) {
  console.log('getting key for contact ' + id);
  return fakeKey;
}

app.get('/', function(req, res) {
  if (!req.query.id) {
    res.statusCode = 400;
    res.jsonp({ error: true });
  } else {
    res.jsonp({ key: encrypt(secret, getKey(req.query.id)) });
  }
});

app.post('/', function(req, res) {
  if (!req.body.id) {
    res.statusCode = 400;
    res.jsonp({ error: true });
  } else {
    res.jsonp({ key: encrypt(secret, createKey(req.body.id, req.body.copyFrom)) });
  }
});

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
