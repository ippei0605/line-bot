/**
 * LINE BOT: コンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const cfenv = require('cfenv');
const vcapServices = require('vcap_services');
const VisualRecognition = require('watson-developer-cloud/visual-recognition/v3')

/** 環境変数 */
exports.appEnv = cfenv.getAppEnv();

/** File System */
exports.fs = require('fs');

/** Path */
exports.path = require('path');

/** Request */
exports.request = require('request');

/**
 * Watson Visual Recognition
 * @see {@link http://www.ibm.com/watson/developercloud/visual-recognition/api/v3/?node#authentication}
 */
const creds = vcapServices.getCredentials('watson_vision_combined');
creds.version_date = '2016-05-20';
exports.visualRecognition = new VisualRecognition(creds);

/**
 * アプリ設定
 * recognizeMode: classify, detectFaces
 */
exports.appSetting = {
    "recognizeMode": "detectFaces"
};

/** ファイル拡張子 */
exports.fileExtension = {
    "image/jpeg": "jpg",
    "image/png": "png"
};