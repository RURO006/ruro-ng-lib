export interface Liff {
  language: string;
  liffData: Context;
  isInLiff: boolean;
  init(successCallback: (data: SuccessData) => void, errorCallback: (err: ErrorData) => void);
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
