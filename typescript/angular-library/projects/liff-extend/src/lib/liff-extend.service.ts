import { Injectable } from '@angular/core';
import { Liff } from './liff';
declare var liff: Liff;

@Injectable({
  providedIn: 'root',
})
export class LiffExtendService {
  private liffId: string;
  private initOnce: Promise<void>;

  async sendMessages(msg: Array<any>): Promise<any> {
    await this.init();
    if (!liff.isInClient()) {
      throw new Error(`liff is not in client!`);
    } else {
      return liff.sendMessages(msg);
    }
  }
  async getProfile(): Promise<{ userId: string; displayName: string; pictureUrl: string; statusMessage: string }> {
    await this.init();
    return liff.getProfile();
  }
  /**
   * 掃描QR code
   */
  async scanCode() {
    await this.init();
    if (!liff.isInClient()) {
      throw new Error(`liff is not in client!`);
    } else {
      return liff.scanCode();
    }
  }
  async closeWindow() {
    await this.init();
    if (!liff.isInClient()) {
      throw new Error(`liff is not in client!`);
    } else {
      liff.closeWindow();
    }
  }
  async openWindow(obj: { url: string; external: boolean }) {
    await this.init();
    liff.openWindow(obj);
  }

  async login() {
    liff.login();
  }

  async logout() {
    liff.logout();
  }

  async init() {
    if (!this.liffId) {
      throw new Error('請呼叫initLiffId(myLiffId))，來初始化liffId');
    }
    // 只初始化一次
    if (!this.initOnce) {
      return (this.initOnce = new Promise(async (allOk) => {
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
        // start to use LIFF's api
        if (!liff.isLoggedIn()) {
          // set `redirectUri` to redirect the user to a URL other than the front page of your LIFF app.
          liff.login();
        }
        allOk();
      }));
    } else {
      return this.initOnce;
    }
  }

  /**
   * @param myLiffId The LIFF ID of the selected element ex: 1234567890-abcedfgh
   */
  initLiffId(myLiffId: string) {
    this.liffId = myLiffId;
  }
  constructor() {}
}
