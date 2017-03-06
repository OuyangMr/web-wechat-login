/**
 * Created by OneMirror on 2017/3/6.
 */
var express  = require('express');
var app      = express();
var webLogin = require('../index');

var wechat = new webLogin({
    appId      : '{{appID}}',
    appSecret  : '{{appSecret}}',
    callbackUrl: '{{http://api.example.com/wechat/callback}}'
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/login', function (req, res) {
    console.log(wechat.loginUrl());
    wechat.login(req, res);
});

app.get('/authorize', function (req, res) {
    console.log(wechat.authorizeUrl());
    wechat.authorize(req, res);
});

app.all('/callback', function (req, res) {
    wechat.callback(req, res).then(function (result) {
        var user = {
            openid    : result.openid,
            unionid   : result.unionid,
            nickname  : result.nickname,
            headimgurl: result.headimgurl,
            sex       : result.sex
        };
        res.jsonp({'status': 0, 'user': user});
    }).catch(function (err) {
        res.send('err' + err);
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});