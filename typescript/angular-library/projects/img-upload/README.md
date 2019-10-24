# 上傳圖片到 aws S3

`方便將圖片上傳到S3，附加修正EXIF、壓縮功能。`

## 使用方法

    有用到md5-typescript加密檔名。
    npm i md5-typescript

```html
<input type="file" accept="image/*" (change)="uploadFile($event)" />
<input type="file" accept="image/*" (change)="uploadFile2($event)" />
```

```ts
import { ImgUploadService } from '@goldenapple/img-upload';
@Component({
  // ...
})
export class SomeComponent {
  constructor(private ius: ImgUploadService) {
    // 初始化
    this.ius.init('S3 accessKeyId', 'S3 secretAccessKey', 's3-bucket-name', 'public-img/user/');
  }

  /**
   * 上傳修正過EXIF且壓縮後的圖片到aws S3
   * */
  async uploadFile($event) {
    const avatar = [];
    const OUT = [];
    for (let i = 0; i < $event.target.files.length; i++) {
      // 取得修正過EXIF Orientation後的圖片的ObjectUrl
      const objUrl = await this.ius.getFixImgObjUrl($event.target.files[i]);
      avatar.push(objUrl);
    }

    for (let i = 0; i < avatar.length; i++) {
      // 儲存到S3
      const src = await this.ius.objUrlToS3Url(avatar[i]);
      // 等同 src=await this.ius.uploadImageFileToS3(await this.ius.objectUrlToBlob(avatar[i]),true,undefined,true);

      // 釋放記憶體
      if (avatar[i].includes('blob:')) {
        URL.revokeObjectURL(avatar[i]);
      }
      OUT.push(src);
    }
    return OUT;
  }

  /**
   * 上傳原始圖片到aws S3
   * */
  async uploadFile2($event) {
    const OUT = [];
    for (let i = 0; i < $event.target.files.length; i++) {
      // 儲存到S3
      const src = await this.ius.uploadImageFileToS3($event.target.files[i], false, undefined, false);
      OUT.push(src);
    }
    return OUT;
  }
}
```
