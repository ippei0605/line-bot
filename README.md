# LINE BOT - Watson Visual Recognition Detect faces  
ドキュメント作成中  

## はじめに  
LINE に顔写真を送信することで、その人にお勧めな情報を提示するという話から、IBM Bluemix の　CF アプリで実装しました。首題の機能を用いて、結果 (JSON) を回答します。  

LINE BOT は Server IP Whitelist にコールバック・アプリケーションのIP アドレスを設定します。しかし、CFアプリの IP アドレスは起動毎に変わってしまい、固定にできません。そこで、次のサイトを参考に、Bluemix のサービス「Statica」(3rd party) を使用して Proxy を構成しました。 (師匠ありがとうございます。)  
- http://dotnsf.blog.jp/archives/2016-04-15.html

## 使い方
LINE アプリの友だち追加で、以下の QR コードを読み込ませてください。  

![QR Code](docs/qr.png)  

実行結果を以下に示します。

![Samole](docs/sample.jpg)  


## アプリの構成

[LINE]--[Bluemix Statica]--[Bluemix Node.js]--[Bluemix Visual Recognition]

## まとめ
- Visual Recognition は直接バイナリデータを扱えないため、LINE BOT との連携は向いてない?  