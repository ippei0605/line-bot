/**
 * @file LINE BOT アプリ
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
const context = require('./utils/context');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const routes = require('./routes');

// アプリケーションを作成する。
const app = express();

// ミドルウェアを設定する。
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(favicon(__dirname + '/public/favicon.ico'));

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// ルートを設定する。
app.get('/', routes.index);
app.post('/callback', routes.callback);

// リクエトを受付ける。
app.listen(context.appEnv.port, '0.0.0.0', function() {
    console.log('server starting on ' + context.appEnv.url);
});