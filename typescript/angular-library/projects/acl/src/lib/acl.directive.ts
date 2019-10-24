import { Directive, OnInit, OnDestroy, Input, HostBinding, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AclService } from './acl.service';

@Directive({
  selector: '[acl]',
})
export class AclDirective implements OnInit, OnDestroy {
  @Input('acl') acl: string[] = [];
  @Input('aclType') aclType = 'any';
  @HostBinding('class.no-permission') noPermission = false;
  private aclChangeSubscription: Subscription;
  // 判斷acl，有權限就顯示，沒有就隱藏。
  constructor(el: ElementRef, private aclService: AclService) {}

  checkAcl() {
    if (this.aclService.checkPermission(this.acl, this.aclType)) {
      this.noPermission = false;
    } else {
      this.noPermission = true;
    }
  }
  ngOnInit(): void {
    this.checkAcl();
    this.aclChangeSubscription = this.aclService.onChangeAcl.subscribe(() => {
      this.checkAcl();
    });
  }
  ngOnDestroy(): void {
    this.aclChangeSubscription.unsubscribe();
  }
}
