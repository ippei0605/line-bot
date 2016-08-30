/**
 * @file LINE BOT アプリ
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('./utils/context');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var routes = require('./routes');

// アプリケーションを作成する。
var app = express();

// ミドルウェアを設定する。
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// ルートを設定する。
app.post('/callback', routes.callback);

// リクエトを受付ける。
app.listen(context.appEnv.port, function () {
    console.log('server starting on ' + context.appEnv.url);
});