import { inject } from '@angular/core';
import { Router, CanActivateFn, CanActivateChildFn } from '@angular/router';
import { AclService } from './acl.service';

export const AclGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router = inject(Router);
    const aclService = inject(AclService);

    // 沒有設定權限，可以直接通行
    if (!('gaAcl' in route.data)) {
        return true;
    }
    // 有包含權限
    const hasPermission = aclService.checkPermission(route.data['gaAcl'], route.data['gaAclType']);
    if (hasPermission) {
        return true;
    } else {
        // 沒有包含權限，跳轉至登入頁
        // 儲存跳轉前的頁面
        aclService.referrer = state.url;
        if (route.data['gaAclUrl']) {
            router.navigateByUrl(route.data['gaAclUrl']);
        }
        return false;
    }
};
