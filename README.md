# web-wechat-login

> 用于web网站实现微信签名和微信登陆的一个node模块，该模块最初开发为在`express`中使用，如需在其他平台使用，可与本人取得联系。

### 安装
```javascript
npm install --save web-wechat-login
```

### 用法简介

#### 构造函数
```javascript
var webLogin = require('web-wechat-login');

var wechat = new webLogin({
    appId : '{{appID}}',
    appSecret:'{{appSecret}}',
    callbackUrl:'{{api.example.com/wechat/callback}}'
});
```

#### wechat.login(req , res);
用于Express的路由routes下，请自定义页面请求地址，访问后自动重定向到微信二维码登陆页面。
示例如下:
```javascript
/* GET wechat login page. */
router.get('/wecaht/login', function (req, res) {
    wechat.login(req, res);
});
```


#### wechat.authorize(req , res);
用于Express的路由routes下，请自定义页面请求地址，手机访问后自动重定向到微信授权页面。
示例如下:
```javascript
/* GET wechat authorize page. */
router.get('/wecaht/authorize', function (req, res) {
    wechat.authorize(req, res);
});
```

### wechat.callback(req , res)
该方法会接收微信回调，并进行一系列认证，直到拿到用户信息。因为openid是唯一的，所以在第一步请求拿到`access_token`后，会有一个`hook`。可以用该`hook`执行查库等逻辑，如果查到则给方法返回信息即可。未查到可不返回。或者返回空。使用示例。方法返回promise。
```javascript

wechat.callback(req, res).then(function (result) {
        var user = {
            openid    : result.openid,
            unionid   : result.unionid,
            nickname  : result.nickname,
            headimgurl: result.headimgurl,
            sex       : result.sex
        };
        req.session.user = user;
        res.redirect('/')
    }).catch(function (err) {
        res.send('err' + err);
    });

```
