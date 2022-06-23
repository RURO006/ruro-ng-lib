import { Injectable } from '@angular/core';
import { Md5 } from 'md5-typescript';
import { ImgOrientationRotate } from './img-orientation-rotate';

declare module AWS {
    export class config {
        accessKeyId: string;
        secretAccessKey: string;
    }
    export class S3 {}
}

@Injectable({
    providedIn: 'root',
})
export class ImgUploadService {
    bucket: any;
    filePath!: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucketName?: string;
    private isInit = false;
    private isInitializing = false;
    private loadOnce?: Promise<void>;

    constructor() {}

    /**
     * 初始化
     * @param accessKeyId S3 accessKeyId
     * @param secretAccessKey S3 secretAccessKey
     * @param bucketName S3 bucketName
     * @param filePath 檔案資料夾位置 ex:'public-img/'
     */
    async init(accessKeyId: string, secretAccessKey: string, bucketName: string, filePath: string = 'public-img/') {
        if (this.isInitializing) {
            return;
        }
        this.isInitializing = true;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.bucketName = bucketName;
        this.filePath = filePath;
        await this.loadScript();
    }

    async loadScript() {
        // 只初始化一次
        if (!this.loadOnce) {
            return (this.loadOnce = new Promise(async (allOk) => {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = `https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.42.0/aws-sdk.min.js`;
                    script.addEventListener('load', () => {
                        this.onLoadS3Js();
                        resolve();
                    });
                    document.body.appendChild(script);
                });

                allOk();
            }));
        } else {
            return this.loadOnce;
        }
    }

    onLoadS3Js() {
        this.isInit = true;
        console.log('Load aws-sdk');
    }

    checkInit() {
        if (!this.isInit) {
            throw new Error('請呼叫init初始化');
        }
        if (!this.accessKeyId) {
            throw new Error('請設定accessKeyId');
        }
        if (!this.secretAccessKey) {
            throw new Error('請設定secretAccessKey');
        }
        if (!this.bucketName) {
            throw new Error('請設定bucketName');
        }
    }

    /**
     * 上傳多個圖片到S3
     * @param files
     * @param isMd5
     */
    uploadAllImageFileToS3(files: FileList | Array<File>, isMd5 = true) {
        const promises = [];
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            promises.push(this.uploadImageFileToS3(item, isMd5));
        }
        return Promise.all(promises);
    }

    /**
     * 上傳圖片到s3
     * @param file 上傳的圖片，可以是File或Blob
     * @param isMd5 是否使用md5當檔名，預設是true
     * @param fileName 檔名，如果加上md5則無用
     * @param isCompressImg 是否壓縮圖片，預設是true
     * @param httpUploadProgress 上傳進度callback
     */
    async uploadImageFileToS3(
        file: File | Blob,
        isMd5 = true,
        fileName?: string,
        isCompressImg = true,
        httpUploadProgress?: (loaded: number, total: number) => void
    ): Promise<string> {
        await this.loadScript();
        this.checkInit();
        // 沒有fileName則補上，但是isMd5的話就得用md5當fileName
        if (!fileName) {
            if (file instanceof File) {
                fileName = file.name;
            } else {
                isMd5 = true;
            }
        }

        // 使用canvas壓縮圖片
        const canvas = document.createElement('canvas');
        let newDataUrl = await this.blobToDataURL(file);
        if (isCompressImg) {
            newDataUrl = await this.compressImage(newDataUrl, canvas);
        }
        // 壓縮完釋放
        canvas.remove();
        return new Promise((resolve, reject) => {
            const aws: any = AWS;
            const blob = this.dataURLtoBlob(newDataUrl);

            aws.config.accessKeyId = this.accessKeyId;
            aws.config.secretAccessKey = this.secretAccessKey;
            this.bucket = new aws.S3({
                params: {
                    Bucket: this.bucketName,
                },
            });
            if (isMd5) {
                fileName = Md5.init(newDataUrl);

                // 壓縮的圖片類型是.jpg
                if (isCompressImg) {
                    fileName += '.jpg';
                }
            }
            const params = {
                Key: this.filePath + fileName,
                Body: blob,
            };
            console.log('bucket upload');
            // TODO: 需要測試404錯誤會發生什麼事情！
            this.bucket
                .upload(params, (err: any, data: any) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const url = data.Location;
                        resolve(url);
                    }
                })
                .on('httpUploadProgress', (progress: { loaded: number; total: number }) => {
                    if (typeof httpUploadProgress === 'function') {
                        httpUploadProgress(progress.loaded, progress.total);
                    }
                });
        });
    }

    /**
     * 轉換格式blob到DataUrl
     * @param blob
     */
    blobToDataURL(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = (e: any) => {
                resolve(e.target.result);
            };
            fr.readAsDataURL(blob);
        });
    }

    /**
     * 轉換格式DataUrl到blob
     * @param dataurl
     */
    dataURLtoBlob(dataurl: string) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = Buffer.from(arr[1], 'utf8').toString('base64');
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    /**
     * 轉換格式ObjectUrl到blob
     * @param objUrl objUrl
     */
    async objectUrlToBlob(objUrl: string) {
        const result = await fetch(objUrl);
        return await result.blob();
    }

    /**
     * Object Url 上傳到S3，並回傳S3 Url。
     * @param objUrl objUrl
     * @returns S3 Url
     */
    async objUrlToS3Url(objUrl: string, progressFunc?: (loaded: number, total: number) => void): Promise<string> {
        // 只有blob才能使用
        if (!objUrl || objUrl.indexOf('blob:') !== 0) {
            return objUrl;
        }
        const result = await this.uploadImageFileToS3(
            await this.objectUrlToBlob(objUrl),
            true,
            undefined,
            true,
            progressFunc
        );
        return result;
    }

    /**
     * 壓縮圖片，回傳dataUrl
     * @param dataUrl 圖片
     * @param imgCompressCanvas 需要提供canvas DOM
     * @returns dataUrl
     */
    async compressImage(dataUrl: string, imgCompressCanvas?: HTMLCanvasElement) {
        let isNoCanvas = false;
        if (!imgCompressCanvas) {
            imgCompressCanvas = document.createElement('canvas');
            isNoCanvas = true;
        }
        const imgElement = new Image();
        let outputDataURL: Promise<string>;
        outputDataURL = new Promise<string>((resolve) => {
            imgElement.onload = () => {
                const maxSize = 5000000;
                const size = imgElement.width * imgElement.height;
                let m: number = 1;
                if (size > maxSize) {
                    m = maxSize / size;
                }
                const newWidth = imgElement.width * m;
                const newHeight = imgElement.height * m;
                const canvas = imgCompressCanvas!;
                const context = canvas.getContext('2d')!;
                canvas.width = newWidth;
                canvas.height = newHeight;

                // 先將背景塗白，之後畫透明圖片背景就會是白色
                context.rect(0, 0, newWidth, newHeight);
                context.fillStyle = 'white';
                context.fill();

                context.drawImage(imgElement, 0, 0, newWidth, newHeight);
                resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
        });
        imgElement.src = dataUrl;
        const OUT = await outputDataURL;
        if (isNoCanvas) {
            imgCompressCanvas.remove();
        }
        imgElement.remove();
        return OUT;
    }

    /**
     * 圖片順時針轉90度，回傳dataUrl
     * @param dataUrl 圖片
     * @param imgCompressCanvas 需要提供canvas DOM
     */
    async rotate90Degrees(dataUrl: string, imgCompressCanvas?: HTMLCanvasElement) {
        let isNoCanvas = false;
        if (!imgCompressCanvas) {
            imgCompressCanvas = document.createElement('canvas');
            isNoCanvas = true;
        }
        const imgElement = new Image();
        let outputDataURL: Promise<string>;
        outputDataURL = new Promise<string>((resolve) => {
            imgElement.onload = () => {
                const newWidth = imgElement.width;
                const newHeight = imgElement.height;
                const canvas = imgCompressCanvas!;
                const context = canvas.getContext('2d')!;
                canvas.width = newHeight;
                canvas.height = newWidth;
                context.translate(newHeight, 0);
                context.rotate((90 * Math.PI) / 180);
                context.drawImage(imgElement, 0, 0, newWidth, newHeight);
                resolve(canvas.toDataURL('image/jpeg', 1));
            };
        });
        imgElement.src = dataUrl;
        const OUT = await outputDataURL;
        if (isNoCanvas) {
            imgCompressCanvas.remove();
        }
        imgElement.remove();
        return OUT;
    }

    /**
     * 取得修正過EXIF Orientation後的圖片的ObjectUrl
     * @param file 圖片(File)
     */
    async getFixImgObjUrl(file: File) {
        let objUrl;
        const imgOrientationRotate = new ImgOrientationRotate();
        try {
            const dataUrl = await imgOrientationRotate.fixImg(file);
            objUrl = URL.createObjectURL(this.dataURLtoBlob(dataUrl));
        } catch (e) {
            console.error('error', e);
            objUrl = URL.createObjectURL(file);
        }
        return objUrl;
    }
}
