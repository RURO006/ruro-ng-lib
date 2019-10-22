import { Injectable } from '@angular/core';
import { Liff } from './liff';
declare var liff: Liff;

@Injectable({
  providedIn: 'root',
})
export class LiffExtendService {
  private liffId: string;
  private loadOnce: Promise<void>;

  async sendMessages(msg: Array<any>): Promise<any> {
    await this.loadScript();
    if (!liff.isInClient()) {
      throw new Error(`liff is not in client!`);
    } else {
      return liff.sendMessages(msg);
    }
  }
  async getProfile(): Promise<{ userId: string; displayName: string; pictureUrl: string; statusMessage: string }> {
    await this.loadScript();
    return liff.getProfile();
  }
  /**
   * 檢查是否登入
   */
  isLoggedIn() {
    return liff.isLoggedIn();
  }

  /**
   * 檢查是否在liff裡面
   */
  isInClient() {
    return liff.isInClient();
  }
  /**
   * 掃描QR code
   */
  async scanCode() {
    await this.loadScript();
    if (!liff.isInClient()) {
      throw new Error(`liff is not in client!`);
    } else {
      return liff.scanCode();
    }
  }
  async closeWindow() {
    await this.loadScript();
    if (!liff.isInClient()) {
      throw new Error(`liff is not in client!`);
    } else {
      liff.closeWindow();
    }
  }
  async openWindow(obj: { url: string; external: boolean }) {
    await this.loadScript();
    liff.openWindow(obj);
  }

  async login() {
    // start to use LIFF's api
    if (!liff.isLoggedIn()) {
      // set `redirectUri` to redirect the user to a URL other than the front page of your LIFF app.
      liff.login();
    }
  }

  async logout() {
    liff.logout();
  }

  async loadScript() {
    if (!this.liffId) {
      throw new Error('請呼叫init(myLiffId)來初始化!');
    }
    // 只初始化一次
    if (!this.loadOnce) {
      return (this.loadOnce = new Promise(async (allOk) => {
        await new Promise((resolve, reject) => {
          const scriptElem = document.createElement('script');
          scriptElem.src = `https://static.line-scdn.net/liff/edge/2.1/sdk.js`;
          scriptElem.addEventListener('load', () => {
            resolve();
          });
          document.body.appendChild(scriptElem);
        });

        await liff.init({
          liffId: this.liffId,
        });

        allOk();
      }));
    } else {
      return this.loadOnce;
    }
  }

  /**
   * @param myLiffId The LIFF ID of the selected element ex: 1234567890-abcedfgh
   */
  async init(myLiffId: string) {
    this.liffId = myLiffId;
    await this.loadScript();
  }
  constructor() {}
}
