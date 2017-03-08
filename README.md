# web-wechat-login

> 用于web网站实现微信签名和微信登陆的一个node模块，该模块最初开发为在`express`中使用，如需在其他平台使用，可与本人取得联系。

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]

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
    callbackUrl:'{{http://api.example.com/wechat/callback}}'
});
```
*appId和appSecret请移步于[微信开发平台](https://open.weixin.qq.com/)上认证申请。*

#### wechat.login(req , res);
用于Express的路由routes下，请自定义页面请求地址，访问后自动重定向到微信二维码登陆页面。
示例如下:
```javascript
/* GET wechat login page. */
router.get('/wechat/login', function (req, res) {
    wechat.login(req, res);
});
```
若需直接获取微信二维码登陆地址，则直接调用loginUrl方法。
示例如下:
```javascript
var loginUrl = wechat.loginUrl();
```
*注：若提示“**redirect_uri 参数错误**”，请检查参数是否填写错误，如`callbackUrl`的域名与审核时填写的授权域名不一致。*

#### wechat.authorize(req , res);
用于Express的路由routes下，请自定义页面请求地址，手机访问后自动重定向到微信授权页面。
示例如下:
```javascript
/* GET wechat authorize page. */
router.get('/wechat/authorize', function (req, res) {
    wechat.authorize(req, res);
});
```
若需直接获取微信认证确认地址，则直接调用authorizeUrl方法。
示例如下:
```javascript
var authorizeUrl = wechat.authorizeUrl();
```

### wechat.callback(req , res)
回调地址请与`callbackUrl`参数保持一致，该方法会接收微信回调，并进行一系列认证，直到拿到用户信息。==请注意，在用户修改微信头像后，旧的微信头像URL将会失效，因此开发者应该自己在获取用户信息后，将头像图片保存下来，避免微信头像URL失效后的异常情况。==
使用示例。方法返回promise。
```javascript
/* listen wechat callback. */
router.all('/wechat/callback', function (req, res) {
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
});
```
#### 返回说明
正确的Json返回结果：

```json
{ 
"openid":"OPENID",
"nickname":"NICKNAME",
"sex":1,
"province":"PROVINCE",
"city":"CITY",
"country":"COUNTRY",
"headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
"privilege":[
"PRIVILEGE1", 
"PRIVILEGE2"
],
"unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
```

参数 | 说明
---|---
openid | 普通用户的标识，对当前开发者帐号唯一
nickname | 普通用户昵称
sex | 普通用户性别，1为男性，2为女性
province | 普通用户个人资料填写的省份
city | 普通用户个人资料填写的城市
country | 国家，如中国为CN
headimgurl | 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空
privilege | 用户特权信息，json数组，如微信沃卡用户为（chinaunicom）
unionid | 用户统一标识。针对一个微信开放平台帐号下的应用，同一用户的unionid是唯一的。
> 建议：开发者最好保存用户**unionID**信息，以便以后在不同应用中进行用户信息互通。

错误的Json返回示例:

```json
{ 
"errcode":40003,"errmsg":"invalid openid"
}
```