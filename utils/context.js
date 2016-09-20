/**
 * LINE BOT: コンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

var STATICA_SERVICE_NAME = 'statica-service';
var VISUAL_RECOGNITION_SERVICE_NAME = 'visual-recognition-service';

// 環境変数を取得する。
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

/** 環境変数 */
exports.appEnv = appEnv;

/** File System */
exports.fs = require('fs');

/** Path */
exports.path = require('path');

/** Request */
exports.request = require('request');

/** STATICA URL */
var staticaCreds = appEnv.getServiceCreds(STATICA_SERVICE_NAME);
exports.staticaUrl = staticaCreds.STATICA_URL;

/** Watson Visual Recognition */
// ref https://github.com/watson-developer-cloud/node-sdk
var watson = require('watson-developer-cloud');
var visualRecognitionCreds = appEnv.getServiceCreds(VISUAL_RECOGNITION_SERVICE_NAME);
var visualRecognition = watson.visual_recognition({
    api_key: visualRecognitionCreds.api_key,
    version: 'v3',
    version_date: '2016-05-19'
});
exports.visualRecognition = visualRecognition;

/** LINE BOT API Header */
exports.headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Line-ChannelID': process.env.CHANNEL_ID,
    'X-Line-ChannelSecret': process.env.CHANNEL_SECRET,
    'X-Line-Trusted-User-With-ACL': process.env.MID
};

/**
 * classify, detectFaces
 */
exports.appSetting = {
    recognizeMode : 'detectFaces'
}