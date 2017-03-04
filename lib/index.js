/**
 * Created by OneMirror on 2017/03/04.
 */
'use strict';
;(function (WechatLogin) {

    var request = require('request');

    let accessToken = {
        access_token : '',
        expires_in   : '',
        refresh_token: '',
        openid       : '',
        scope        : ''
    };

    /**
     * website qrcode login request
     */
    WechatLogin.prototype.login = function (req, res) {
        let redirectUrl = 'https://open.weixin.qq.com/connect/qrconnect?appid='
            + this.APP_ID + '&redirect_uri=' + this.REDIRECT_URI + '&response_type=code&scope=' + this.SCOPE_WEB_LOGIN + '#wechat_redirect';
        res.redirect(redirectUrl);
    };

    /**
     * wechat authorize directly（without scan qrcode）
     */
    WechatLogin.prototype.authorize = function (res) {
        let redirectUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='
            + this.APP_ID + '&redirect_uri=' + this.REDIRECT_URI + '&response_type=code&scope=' + this.SCOPE_WEB_LOGIN + '#wechat_redirect';
        res.redirect(redirectUrl);
    };

    /**
     * wechat callback
     */
    WechatLogin.prototype.callback = cbFuncHandler;

    /*
     * send request Promise
     */
    function sendRequest(url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        if (body.errcode) {
                            console.warn(body.errmsg);
                            reject(body.errmsg);
                        }
                        else {
                            resolve(body);
                        }
                    }
                    else {
                        console.warn(error);
                        reject(error);
                    }
                }
            );
        });
    }

    /*
     * wechat callback handler
     */
    function cbFuncHandler(req, res) {
        return new Promise((resolve, reject) => {
            let code = req.query.code;
            // authorize succeed when result code is not null
            if (code) {
                //fetch access_token
                let url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + this.APP_ID + '&secret=' + this.APP_SECRET + '&code=' + code + '&grant_type=authorization_code';
                sendRequest(url)
                    .then((response) => {
                        if (response) {
                            accessToken = JSON.parse(response);
                            //check access_token for weather it is invalid
                            url         = 'https://api.weixin.qq.com/sns/auth?access_token=' + accessToken.access_token + '&openid=' + accessToken.openid;
                            return sendRequest(url);
                        }
                    })
                    .then((response) => {
                        if (response) {
                            response = JSON.parse(response);
                            if (response.errcode != 0) { //access_token invalid when errcode is not equal 0
                                //refresh access_token
                                url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + this.APP_ID + '&grant_type=refresh_token&refresh_token=' + accessToken.refresh_token;
                                return sendRequest(url);
                            }
                            else {
                                return null;
                            }
                        }
                    })
                    .then((response) => {
                        if (response) {
                            accessToken = JSON.parse(response);
                        }
                        //get userinfo from wechat
                        url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + accessToken.access_token + '&openid=' + accessToken.openid;
                        return sendRequest(url);
                    })
                    .then((info) => {
                        if (info) {
                            info = JSON.parse(info);
                            if (info.openid) {
                                resolve(info)
                            }
                            else {
                                reject(info)
                            }
                        }
                    })
                    .catch((e) => {
                        reject(e);
                    });
            }
            else {
                reject('fail of empty code!');
            }
        })
    }

    module.exports = WechatLogin;

})(function (config) {
    this.APP_ID          = config.appId;
    this.APP_SECRET      = config.appSecret;
    this.REDIRECT_URI    = encodeURIComponent(config.callbackUrl);
    this.SCOPE_WEB_LOGIN = 'snsapi_login';
});