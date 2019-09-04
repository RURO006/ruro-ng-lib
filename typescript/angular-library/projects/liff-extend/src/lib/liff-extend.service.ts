import { Injectable } from '@angular/core';
import { Liff, Context } from './liff';
declare var liff: Liff;

@Injectable({
  providedIn: 'root',
})
export class LiffExtendService {
  private _isInLiff: Promise<boolean>;
  get liffData(): Context {
    return liff.liffData;
  }
  get language(): string {
    return liff.language;
  }
  async isInLiff(): Promise<boolean> {
    return await this._isInLiff;
  }
  async sendMessages(msg: Array<any>): Promise<any> {
    await this.init();
    return liff.sendMessages(msg);
  }
  async getProfile(): Promise<{ userId: string; displayName: string; pictureUrl: string; statusMessage: string }> {
    await this.init();
    return liff.getProfile();
  }
  async closeWindow() {
    await this.init();
    liff.closeWindow();
  }
  async openWindow(obj: { url: string; external: boolean }) {
    await this.init();
    liff.openWindow(obj);
  }
  async init() {
    if (this._isInLiff) {
      return this._isInLiff;
    }
    return (this._isInLiff = new Promise((resolve) => {
      liff.init(
        (data) => {
          liff.isInLiff = true;
          liff.language = data.language;
          liff.liffData = data.context;
          resolve(true);
        },
        (err) => {
          liff.isInLiff = false;
          resolve(false);
        }
      );
    }));
  }

  constructor() {}

  async sendOrderByOrderUrl(url: string) {}
}
