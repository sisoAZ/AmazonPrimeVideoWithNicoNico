# AmazonPrimeVideoWithNicoNico

## 概要
アマゾンプライムの動画をニコニコのコメントと一緒に見れるようにする、Google Chrome拡張機能です。

## 使い方
### 1. ソースコードをダウンロード
```
git clone https://github.com/aetenotnk/AmazonPrimeVideoWithNicoNico.git
```
または、zipをダウンロードします。

### 2. Google Chromeを開く
Google Chromeのウィンドウをすべて閉じた状態で、セキュリティを無効にして開きます。

**Widnwos**
```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C://Chrome dev session
```
**Mac**
```
open /Applications/Google\ Chrome.app/ --args --disable-web-security --user-data-dir
```

### 3. 拡張機能を設定する
1. chrome://extensions/ を開きます。
1. デベロッパーモードを有効にします。
1. 「パッケージ化されていない拡張機能を読み込む」からダウンロードしたソースコードのフォルダを選択します。

### 4. ニコニコ動画にログインする
ニコニコ動画にログインしていなければ、ログインします。  
https://account.nicovideo.jp/login

### 5. Amazon Primeの動画にコメントを表示する
使い方は下記動画を参照してください。  
https://www.nicovideo.jp/watch/sm35618213

### 6. 使い方
アマゾンプライムで見たい動画を選択し、動画の再生が始まったら拡張機能からAmazonPrimeVideoWithNicoNicoを選択して、動画IDを入れる。動画IDはニコニコ動画の視聴ページにあります。nicovideo.jp/watch/so42904900だったらso42904900が動画ID
