export class ImgOrientationRotate {
  af2Base64(af) {
    const base64 = btoa([].reduce.call(new Uint8Array(af), (p, c) => p + String.fromCharCode(c), ''));
    return 'data:image/jpeg;base64,' + base64;
  }
  async readFile(file) {
    const FR = new FileReader();
    return new Promise((resolve, reject) => {
      FR.onloadend = (evt: any) => {
        resolve(evt.target.result);
      };
      FR.onerror = (err) => {
        reject(err);
      };
      FR.readAsArrayBuffer(file);
    });
  }

  rotateCtx(orieVal, ctx, width, height) {
    switch (orieVal) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        ctx.transform(1, 0, 0, 1, 0, 0);
    }
    return ctx;
  }

  async parse(view) {
    return new Promise((resolve, reject) => {
      let offset = 0;
      const len = view.byteLength;
      let APP1_offset;
      let TIFF_offset;
      let EXIF_offset;
      let little;
      let IFD0_offset;
      let entries_count;
      let entries_offset;

      // SOI marker
      if (view.getUint16(0, false) != 0xffd8) reject('不是 JPEG 文件');

      // APP1 marker
      while (offset < len) {
        if (view.getUint16(offset, false) == 0xffe1) break;
        else offset += 2;
      }

      if (offset >= len) reject('没找到 APP1 标识');

      // now offset point to APP1 marker 0xFFD8
      APP1_offset = offset;

      // offset + 4 point offset to EXIF Header
      EXIF_offset = APP1_offset + 4;

      // check if  have 'Exif' ascii string: 0x45786966
      if (view.getUint32(EXIF_offset, false) != 0x45786966) reject('无 EXIF 信息');

      TIFF_offset = EXIF_offset + 6;

      // offset + 4 point offset to EXIF header's 0x0000
      // offset + 4 + 2 point offset to TIFF header
      // 0x4d4d: big endian, 0x4949: little endian
      little = view.getUint16(TIFF_offset, false) == 0x4949 ? true : false;

      IFD0_offset = TIFF_offset + view.getUint32(TIFF_offset + 4);

      entries_count = view.getUint16(IFD0_offset, little);
      entries_offset = IFD0_offset + 2;

      for (let i = 0; i < entries_count; i++) {
        // 0x0112's format is 3 which value format is unsigned short
        // components is 1
        // 3 * 1 < 4
        // so the value offset is actually value not the offset to the value
        if (view.getUint16(entries_offset + i * 12, little) == 0x0112) {
          let resolve_value = view.getUint16(entries_offset + i * 12 + 8, little);
          resolve(resolve_value);
        }
      }
      reject('没有 orientation 信息');
    });
  }

  async fixImg(files): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let image;
      let base64;
      let view;
      try {
        const af: any = await this.readFile(files);
        base64 = this.af2Base64(af);
        view = new DataView(af);
        image = new Image();
      } catch (e) {
        reject(e);
        return;
      }

      image.src = base64;
      image.onload = async (e) => {
        try {
          const target: any = e.target;
          const canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');
          const width = 1200;
          const height = (1200 / target.width) * target.height;

          canvas.width = width;
          canvas.height = height;
          // 1. 未获得 exif.orientation 值的 canvas 裁切
          //   ctx.drawImage(e.target, 0, 0, width, height);
          //   $preview.src = canvas.toDataURL();

          // 2.获取 exif.orientation 值之后的 canvas 裁切
          const val: any = await this.parse(view);

          // 5, 6, 7, 8 是 1, 2, 3, 4 的镜像
          if ([5, 6, 7, 8].indexOf(val) > -1) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          ctx = this.rotateCtx(val, ctx, width, height);
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 1.0));
        } catch (err) {
          reject(err);
          return;
        }
      };
    });
  }
}
