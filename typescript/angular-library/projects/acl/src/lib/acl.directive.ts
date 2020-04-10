import { Directive, OnInit, OnDestroy, Input, HostBinding, ElementRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { AclService } from './acl.service';

@Directive({
    selector: '[gaAcl]',
    exportAs: 'ga-acl',
})
export class AclDirective implements OnInit, OnDestroy {
    @Input('gaAcl') acl: string[] = [];
    @Input() gaAclType = 'any';
    private _noPermission = false;
    @Output() noPermissionChange = new EventEmitter<boolean>();
    @HostBinding('class.no-permission') get noPermission(): boolean {
        return this._noPermission;
    }
    set noPermission(value: boolean) {
        this._noPermission = value;
        this.noPermissionChange.emit(value);
    }

    private aclChangeSubscription: Subscription;

    // 判斷acl，有權限就顯示，沒有就隱藏。
    constructor(el: ElementRef, private aclService: AclService) {
        this.aclChangeSubscription = this.aclService.onChangeAcl.subscribe(async () => {
            this.checkAcl();
        });
    }
    checkAcl() {
        if (this.aclService.checkPermission(this.acl, this.gaAclType)) {
            this.noPermission = false;
        } else {
            this.noPermission = true;
        }
    }
    ngOnInit(): void {
        this.checkAcl();
    }
    ngOnDestroy(): void {
        this.aclChangeSubscription.unsubscribe();
    }
}

@Directive({
    selector: '[gaAcl][gaAclAutoDisable]',
    exportAs: 'ga-acl-auto-disable',
})
export class AclAutoDisableDirective implements OnInit {
    @Input() gaAclAutoDisable = true;
    @HostBinding('disabled') disable;
    constructor(private aclDirective: AclDirective) {
        this.aclDirective.noPermissionChange.subscribe(async (noPermission) => {
            // setTimeout:解決disable沒有反應的BUG，gaAclAutoDisable沒有值的BUG
            setTimeout(() => {
                // 由於在ngOnInit才註冊(不是在constructor)，所以先取值一次
                if (this.gaAclAutoDisable) {
                    this.disable = noPermission;
                }
            });
        });

        // setTimeout:解決disable沒有反應的BUG，gaAclAutoDisable沒有值的BUG
        setTimeout(() => {
            // 初始化先設定
            this.disable = this.gaAclAutoDisable;
        });
    }
    ngOnInit(): void {
        // setTimeout:解決disable沒有反應的BUG，gaAclAutoDisable沒有值的BUG
        setTimeout(() => {
            // 由於在ngOnInit才註冊(不是在constructor)，所以先取值一次
            if (this.gaAclAutoDisable) {
                this.disable = this.aclDirective.noPermission;
            }
        });
    }
}
