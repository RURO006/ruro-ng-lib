# LiffExtend

在 angular 中更方便的使用 liff。

## 使用前 index.html

在 index.html 裡加上 line 的 liff sdk
ex:

<script src="https://d.line-scdn.net/liff/1.0/sdk.js"></script>

## 加到 service

constructor(
private liff: LiffExtendService
) {
...
}

## 使用

// 參考:https://developers.line.biz/en/reference/liff/
// 初始化
await this.liff.init();
// 初始化後可以拿到 ID
const lineId = this.liff.liffData.userId;
// 取得個人資料
const profile = await this.liff.getProfile();

// 判斷是否有 liff
if (await this.liff.isInLiff()) {
// 傳送訊息 內容參考:https://developers.line.biz/en/reference/liff/#send-messages
this.liff.sendMessages(........);
// 關閉視窗
this.liff.closeWindow();
}
