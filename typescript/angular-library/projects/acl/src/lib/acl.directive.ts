import { Directive, OnInit, OnDestroy, Input, HostBinding, ElementRef, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AclService } from './acl.service';

@Directive({
    selector: '[gaAcl]',
    exportAs: 'ga-acl',
})
export class AclDirective implements OnInit, OnDestroy {
    /**
     * ex:['管理員','一般使用者','老闆']
     * default: []
     */
    @Input('gaAcl') acl: string[] = [];
    /**
     * 'any' or 'all'
     * default: any
     */
    @Input() gaAclType = 'any';
    private _permission = false;

    /**
     * 元件的permission發生變化時觸發，使用BehaviorSubject初次訂閱會拿到最新的值，訂閱後記得要在ngOnDestroy取消訂閱。
     */
    @Output() permissionChange = new BehaviorSubject<boolean>(this._permission);

    /**
     * 綁定class"no-permission"
     */
    @HostBinding('class.no-permission') get noPermissionClass(): boolean {
        return !this._permission;
    }

    get permission(): boolean {
        return this._permission;
    }
    set permission(value: boolean) {
        this._permission = value;
        this.permissionChange.next(value);
    }

    private aclChangeSubscription: Subscription;

    // 判斷acl，有權限就顯示，沒有就隱藏。
    constructor(el: ElementRef, private aclService: AclService) {}
    checkAcl() {
        this.permission = this.aclService.checkPermission(this.acl, this.gaAclType);
    }
    ngOnInit(): void {
        this.aclChangeSubscription = this.aclService.onChangeAcl.subscribe(async () => {
            this.checkAcl();
        });
    }
    ngOnDestroy(): void {
        this.aclChangeSubscription.unsubscribe();
    }
}

/**
 * 擴充AclDirective相關的Directive可以繼承此類別
 */
@Directive()
export abstract class GaAclBaseDirective implements OnInit, OnDestroy {
    protected permissionChangeSubscription: Subscription;
    constructor(public aclDirective: AclDirective) {}

    ngOnInit(): void {
        this.permissionChangeSubscription = this.aclDirective.permissionChange
            .pipe(distinctUntilChanged())
            .subscribe(this.permissionChange.bind(this));
    }

    /**
     * 元件的permission發生變化時觸發
     * @param permission 是否有權限
     */
    abstract permissionChange(permission: boolean): void;

    ngOnDestroy(): void {
        this.permissionChangeSubscription.unsubscribe();
    }
}

@Directive({
    selector: '[gaAcl][gaAclAutoDisable]',
    exportAs: 'ga-acl-auto-disable',
})
export class AclAutoDisableDirective extends GaAclBaseDirective {
    /**
     * 是否要在沒有權限時自動disabled
     */
    @Input() gaAclAutoDisable = true;
    @HostBinding('disabled') disable;

    constructor(public aclDirective: AclDirective) {
        super(aclDirective);
    }

    permissionChange(permission: boolean): void {
        if (this.gaAclAutoDisable) {
            this.disable = !permission;
        }
    }
}

@Directive({
    selector: '[gaAcl][gaAclHasPermissionClass],[gaAcl][gaAclNoPermissionClass]',
})
export class AclClassDirective extends GaAclBaseDirective {
    _gaAclHasPermissionClass = '';
    _gaAclNoPermissionClass = '';
    private nowPermission = false;
    /**
     * 當元件有權限時要顯示的class
     */
    @Input() set gaAclHasPermissionClass(value) {
        this._gaAclHasPermissionClass = value;
    }
    get gaAclHasPermissionClass(): string {
        return this._gaAclHasPermissionClass;
    }
    /**
     * 當元件沒有權限時要顯示的class
     */
    @Input() set gaAclNoPermissionClass(value) {
        this._gaAclNoPermissionClass = value;
    }
    get gaAclNoPermissionClass(): string {
        return this._gaAclNoPermissionClass;
    }

    @HostBinding('class') classes;
    constructor(public aclDirective: AclDirective) {
        super(aclDirective);
    }

    permissionChange(permission: boolean): void {
        this.nowPermission = permission;
        this.setClass();
    }
    private setClass(): void {
        this.classes = this.nowPermission ? this.gaAclHasPermissionClass : this.gaAclNoPermissionClass;
    }
}
