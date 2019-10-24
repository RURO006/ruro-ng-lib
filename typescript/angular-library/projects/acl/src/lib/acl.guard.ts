import { Injectable } from '@angular/core';
import {
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  CanActivate,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AclService } from './acl.service';

@Injectable()
export class AclGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private aclService: AclService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.action(next, state);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.action(next, state);
  }

  action(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // 沒有設定權限，可以直接通行
    if (!('acl' in next.data)) {
      return true;
    }
    // 有包含權限
    const hasPermission = this.aclService.checkPermission(next.data['acl'], next.data['aclType']);
    if (hasPermission) {
      return true;
    } else {
      // 沒有包含權限，跳轉至登入頁
      // 儲存跳轉前的頁面
      this.aclService.referrer = state.url;
      if (next.data['aclUrl']) {
        this.router.navigateByUrl(next.data['aclUrl']);
      }
      return false;
    }
  }
}
