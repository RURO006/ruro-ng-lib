import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AclService {
    private _acl: string[] = [];

    /**
     * 跳轉頁面，權限不足時會儲存當下頁面，可以用在登入後跳轉回權限不足的頁面。
     */
    public referrer?: string;

    /**
     * 當呼叫setAcl時會觸發，使用BehaviorSubject初次訂閱會拿到最新的值，訂閱後記得要在ngOnDestroy取消訂閱。
     */
    public onChangeAcl = new BehaviorSubject<string[]>([]);

    constructor() {}

    /**
     * 設定權限 ex:['管理員','一般使用者','老闆']
     */
    setAcl(acl: string[]) {
        if (!(acl instanceof Array)) {
            throw new Error('gaAcl必須是string[]');
        }
        this._acl = acl;
        this.onChangeAcl.next(acl);
    }

    /**
     * 取得權限 ex:['管理員','一般使用者','老闆']
     */
    getAcl(): string[] {
        return this._acl;
    }

    /**
     * 檢查是否有權限
     * @param acl ex:['管理員','一般使用者']
     * @param type ex:'any','all'
     */
    checkPermission(acl: string[], type: string = 'any') {
        if (!(acl instanceof Array)) {
            throw new Error('gaAcl必須是string[]');
        }
        // 沒有設定權限，可以直接通行
        if (acl.length === 0) {
            return true;
        }
        if (type === 'any') {
            return acl.some((dataAcl) => this._acl.some((userAcl) => dataAcl === userAcl));
        } else if (type === 'all') {
            return acl.every((dataAcl) => this._acl.some((userAcl) => dataAcl === userAcl));
        } else {
            throw new Error('gaAclType必須是"any"、"all"其中一個');
        }
    }
}
