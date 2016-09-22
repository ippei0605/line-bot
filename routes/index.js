/**
 * LINE BOT : ルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');

// LINE BOT API を呼出す。
var callLineBotApi = function (options, callback) {
    context.request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body, response);
        } else {
            console.log('error: ' + JSON.stringify(error));
            console.log('response: ' + JSON.stringify(response));
        }
    });
};

// テキストメッセージを送信する。
var sendText = function (text, content) {
    // 送信データを作成する。
    var data = {
        "to": [content.from],
        "toChannel": 1383378250,
        "eventType": "138311608800106203",
        "content": {
            "contentType": 1,
            "toType": 1,
            "text": text
        }
    };

    //オプションを定義する。
    var options = {
        "method": "POST",
        "url": "https://trialbot-api.line.me/v1/events",
        "proxy": context.staticaUrl,
        "headers": context.headers,
        "json": true,
        "body": data
    };

    // LINE BOT API: Sending messages (Text)
    callLineBotApi(options, function (body) {
        console.log(body);
    });
};

// Header 文字列からファイル名を取得する。
var getFilename = function (contentDisposition) {
    var temp = contentDisposition.match(/^attachment; filename=\"(.*)\"$/);
    return temp ? temp[1] : 'default';
};

// Visual Recognition のパラメータを返す。
var getRecognizeParam = function (body, response) {
    // イメージファイルを保存する。 (Visual Recognitionに直接バイナリファイルを渡せないため)
    var filename = '../tmp/' + getFilename(response.headers['content-disposition']);
    context.fs.writeFileSync(filename, body);
    return {
        "images_file": context.fs.createReadStream(filename)
    };
};

// Visual Recognition の結果
var result = function (err, response, content) {
    if (err) {
        console.log('error: ' + err);
    } else {
        sendText(JSON.stringify(response, undefined, 2), content);
    }
};

// recognizeMode毎の処理を定義
var selectRecognizeMode = {
    "detectFaces": function (content, body, response) {
        sendText('顔写真を解析します。', content);
        context.visualRecognition.detectFaces(getRecognizeParam(body, response), function (err, response) {
            result(err, response, content);
        });
    },
    "classify": function (content, body, response) {
        sendText('何が写ってるか解析します。', content);
        context.visualRecognition.classify(getRecognizeParam(body, response), function (err, response) {
            result(err, response, content);
        });
    }
};

// 画像を解析する。
var recognize = function (content) {
    sendText('画像を解析します。', content);
    var id = content.id;

    //オプションを定義
    var options = {
        "url": "https://trialbot-api.line.me/v1/bot/message/" + id + "/content",
        "encoding": null,
        "proxy": context.staticaUrl,
        "headers": context.headers,
        "json": true
    };

    // LINE BOT API: Getting message content
    callLineBotApi(options, function (body, response) {
        selectRecognizeMode[context.appSetting.recognizeMode](content, body, response);
    });
};

// コマンド定義
var command = {
    "cmd:help": function (content) {
        sendText('cmdのリスト\nshowSetting\nrecognizeMode=faces\nrecognizeMode=classify', content);
    },
    "cmd:showSetting": function (content) {
        sendText(JSON.stringify(context.appSetting), content);
    },
    "cmd:recognizeMode=faces": function (content) {
        context.appSetting.recognizeMode = 'detectFaces';
        sendText(JSON.stringify(context.appSetting), content);
    },
    "cmd:recognizeMode=classify": function (content) {
        context.appSetting.recognizeMode = 'classify';
        sendText(JSON.stringify(context.appSetting), content);
    }
};

// テキストがコマンドかどうか判定する。
var isCommand = function (text) {
    var ret = false;
    for (var key in command) {
        if (key === text) {
            ret = true;
            break;
        }
    }
    return ret;
};

// 会話する。(勉強中)
var converse = function (content) {
    var text = content.text;
    if (isCommand(text)) {
        command[text](content)
    } else {
        sendText('会話は勉強中です。もう少し待ってください。', content);
    }
};

/**
 * LINE から呼び出されるコールバック
 * @see {@link https://developers.line.me/bot-api/api-reference#receiving_messages}
 */
exports.callback = function (req, res) {
    var content = req.body.result[0].content;
    switch (content.contentType) {
        case 1:
            // Text message
            converse(content);
            break;
        case 2:
            // Image message
            recognize(content);
            break;
        default:
            sendText('写真を送ってください。', content);
    }
};

/** テストページを表示する。 */
exports.index = function (req, res) {
    res.sendStatus(200);
};