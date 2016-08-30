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
        'to': [content.from],
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
        method: 'POST',
        url: 'https://trialbot-api.line.me/v1/events',
        proxy: context.staticaUrl,
        headers: context.headers,
        json: true,
        body: data
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
}

// 顔を見つける。
var detectFaces = function (content) {
    var id = content.id;
    // 送信データ作成
    var data = {
        'to': [content.from],
        "toChannel": 1383378250,
        "eventType": "138311608800106203",
        "content": {
            "toType": 1,
            "createdTime": 1448616197774,
            "from": "u90efb18b1449b80dfe176e490058124a",
            "location": null,
            "id": id,
            "to": ["u9a1701809838503fc3f9a7048d819ccf"],
            "text": "",
            "contentMetadata": null,
            "deliveredTime": 0,
            "contentType": 2,
            "seq": null
        },
        "createdTime": 1448616198606,
        "eventType": "138311609000106303",
        "from": "uefb896062d34df287b220e7b581d24a6",
        "fromChannel": 1341301815,
        "id": "ABCDEF-12345678901",
        "to": ["uaf73f6500f6bd2e8f1697782c042420d"],
        "toChannel": 1441301333
    };

    //オプションを定義
    var options = {
        url: 'https://trialbot-api.line.me/v1/bot/message/' + id + '/content',
        encoding: null,
        proxy: context.staticaUrl,
        headers: context.headers,
        json: true
    };

    // LINE BOT API: Getting message content
    callLineBotApi(options, function (body, response) {
        // イメージファイルを保存する。 (Visual Recognitionに直接バイナリファイルを渡せないため)
        var filename = '../tmp/' + getFilename(response.headers['content-disposition']);
        context.fs.writeFileSync(filename, body);

        // Visual Recognition Detect faces
        context.visualRecognition.detectFaces({
            images_file: context.fs.createReadStream(filename)
        }, function (err, response) {
            if (err) {
                console.log('error: ' + err);
            } else {
                sendText(JSON.stringify(response, undefined, 2),content);
            }
        });

    });
};

/** LINE から呼び出されるコールバック */
exports.callback = function (req, res) {
    var content = req.body.result[0].content;
    if (content.contentType == 2) {
        detectFaces(content);
    } else {
        sendText('顔写真を送ってください。', content);
    }
};