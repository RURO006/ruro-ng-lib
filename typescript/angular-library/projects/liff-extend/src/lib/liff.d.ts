export interface Liff {
  init(options: { liffId: string }): Promise<SuccessData>;
  isLoggedIn(): boolean;
  isInClient(): boolean;
  login();
  logout();
  scanCode(): Promise<any>;
  sendMessages(msg: Array<any>): Promise<any>;
  getProfile(): Promise<{ userId: string; displayName: string; pictureUrl: string; statusMessage: string }>;
  closeWindow();
  openWindow({ url: string, external: boolean });
}

export interface SuccessData {
  language: string;
  context: Context;
}

export interface Context {
  userId: string;
  type: string;
  [key: string]: string;
  viewType: string;
}

export interface ErrorData {
  code: string;
  message: string;
}
