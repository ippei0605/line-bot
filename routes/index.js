/**
 * LINE BOT : ルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const context = require('../utils/context');

// LINE BOT API を呼出す。
const callLineBotApi = (options, callback) => {
    context.request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body, response);
        } else {
            console.log('error: ' + JSON.stringify(error));
            console.log('response: ' + JSON.stringify(response));
        }
    });
};

/**
 * 返信する。
 * @param text テキスト
 * @param event イベント
 * @see {https://devdocs.line.me/en/#push-message}
 */
const pushMessage = (text, event) => {
    const data = {
        "to": event.source.userId,
        "messages": [
            {
                "type": "text",
                "text": text
            }
        ]
    };

    const options = {
        "method": "POST",
        "url": "https://api.line.me/v2/bot/message/push",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
        },
        "json": true,
        "body": data
    };

    callLineBotApi(options, function (body) {
        console.log(body);
    });
};

// Visual Recognition のパラメータを返す。
const getRecognizeParam = (body, response) => {
    // Header からファイル名を作成する。
    let filename = '../tmp/' + response.headers['x-line-request-id'];
    let ext = context.fileExtension[response.headers['content-type']];
    if (ext) {
        filename += '.' + ext;
    }

    // イメージファイルを保存する。 (Visual Recognitionに直接バイナリファイルを渡せないため)
    context.fs.writeFileSync(filename, body);
    return {
        "images_file": context.fs.createReadStream(filename)
    };
};

// Visual Recognition の結果
const result = (err, response, event) => {
    if (err) {
        console.log('error: ' + JSON.stringify(err));
        pushMessage('画像認識に失敗しました。', event);
    } else {
        pushMessage(JSON.stringify(response, undefined, 2), event);
    }
};

/**
 * recognizeMode毎の処理を定義
 * @see {http://www.ibm.com/watson/developercloud/visual-recognition/api/v3/?node#detect_faces}
 * @see {http://www.ibm.com/watson/developercloud/visual-recognition/api/v3/?node#classify_an_image}
 */
const selectRecognizeMode = {
    "detectFaces": function (event, body, response) {
        pushMessage('顔を認識します。', event);
        context.visualRecognition.detectFaces(getRecognizeParam(body, response), function (err, response) {
            result(err, response, event);
        });
    },
    "classify": function (event, body, response) {
        pushMessage('何が写ってるか解析します。', event);
        context.visualRecognition.classify(getRecognizeParam(body, response), function (err, response) {
            result(err, response, event);
        });
    }
};

/**
 * 画像を解析する。
 * @param event イベント
 * @see {https://devdocs.line.me/en/#get-content}
 */
const recognize =  (event) =>{
    pushMessage('画像を受信しました。', event);
    const options = {
        "method": "GET",
        "url": "https://api.line.me/v2/bot/message/" + event.message.id + "/content",
        "encoding": null,
        "headers": {
            "Authorization": "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
        }
    };

    callLineBotApi(options, function (body, response) {
        selectRecognizeMode[context.appSetting.recognizeMode](event, body, response);
    });
};

// コマンド定義
const command = {
    "cmd:help": function (event) {
        pushMessage('cmdのリスト\nshowSetting\nrecognizeMode=faces\nrecognizeMode=classify', event);
    },
    "cmd:showSetting": function (event) {
        pushMessage(JSON.stringify(context.appSetting), event);
    },
    "cmd:recognizeMode=faces": function (event) {
        context.appSetting.recognizeMode = 'detectFaces';
        command["cmd:showSetting"](event);
    },
    "cmd:recognizeMode=classify": function (event) {
        context.appSetting.recognizeMode = 'classify';
        command["cmd:showSetting"](event);
    }
};

// テキストがコマンドかどうか判定する。
const isCommand = (text) => {
    let ret = false;
    for (let key in command) {
        if (key === text) {
            ret = true;
            break;
        }
    }
    return ret;
};

// 会話する。(勉強中)
const converse = (event) => {
    let text = event.message.text;
    if (isCommand(text)) {
        command[text](event)
    } else {
        pushMessage('会話は勉強中です。もう少し待ってください。', event);
    }
};

/**
 * LINE から呼び出されるコールバック
 * @see {@link https://devdocs.line.me/en/#common-specifications}
 */
exports.callback = (req, res) => {
    const event = req.body.events[0];
    switch (event.message.type) {
        case 'text':
            converse(event);
            break;
        case 'image':
            recognize(event);
            break;
        default:
            pushMessage('写真を送ってください。', event);
    }
};

/** テストページを表示する。 */
exports.index = (req, res) => {
    res.sendStatus(200);
};