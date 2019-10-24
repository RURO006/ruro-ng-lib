# LiffExtend

在 angular 中更方便的使用 liff。

## 新增 service 到 component

```ts
import { LiffExtendService } from '@goldenapple/liff-extend';
@Component({
  // ...
})
export class SomeComponent implements OnInit {
  constructor(private liff: LiffExtendService) {
    this.liff.init('1612312312-97ooOOoY').then(async () => {
      const profile = await this.liff.getProfile();
      // ...
    });
  }
}
```

## 使用

```ts
// 參考:https://developers.line.biz/en/reference/liff/
// 初始化
await this.liff.init('1612312312-97ooOOoY');
// 取得使用者資料
const profile = await this.liff.getProfile();
// line id
this.userId = profile.userId;
// line name
this.displayName = profile.displayName;
// 大頭照
this.pictureUrl = profile.pictureUrl;
// 狀態訊息
this.statusMessage = profile.statusMessage;

// 判斷是否在liff裡，大部分的function都必須在liff才能使用
if (this.liff.isInClient()) {
  // 傳送訊息 內容參考:https://developers.line.biz/en/reference/liff/#send-messages
  this.liff.sendMessages([
    // ...
  ]);
  // 關閉視窗
  this.liff.closeWindow();

  // 掃描QR code
  let result = await this.liff.scanCode();
}

// 登入
if (!this.liff.isLoggedIn()) {
  this.liff.login();
}
```
