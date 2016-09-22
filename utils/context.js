/**
 * LINE BOT: コンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

// 環境変数を取得する。
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

// VCAP_SERVICES
var vcapServices = JSON.parse(process.env.VCAP_SERVICES);

/** 環境変数 */
exports.appEnv = appEnv;

/** File System */
exports.fs = require('fs');

/** Path */
exports.path = require('path');

/** Request */
exports.request = require('request');

/** STATICA URL */
var staticaCreds = vcapServices.statica[0].credentials;
exports.staticaUrl = staticaCreds.STATICA_URL;

/** Watson Visual Recognition */
var watson = require('watson-developer-cloud');
var visualRecognitionCreds = vcapServices.watson_vision_combined[0].credentials;
var visualRecognition = watson.visual_recognition({
    "api_key": visualRecognitionCreds.api_key,
    "version": "v3",
    "version_date": "2016-05-19"
});
exports.visualRecognition = visualRecognition;

/** LINE BOT API Header */
exports.headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "X-Line-ChannelID": process.env.CHANNEL_ID,
    "X-Line-ChannelSecret": process.env.CHANNEL_SECRET,
    "X-Line-Trusted-User-With-ACL": process.env.MID
};

/**
 * アプリ設定
 * recognizeMode: classify, detectFaces
 */
exports.appSetting = {
    "recognizeMode": "detectFaces"
};