# import 到要使用的 module 裡

`Service 為必須，Guard、Directive 視用途而定`

```ts
import { AclModule } from '@goldenapple/acl';
@NgModule({
  declarations: [...],
  imports: [AclModule],
  providers: [...],
})
export class SomeModule {}
```

## Guard 使用 ，需要搭配 Service 設定權限

`AclGuard守衛，針對router設定的權限進行阻擋、跳轉。`

    在router設定(ex: some-routing.module.ts)，canActivateChild使用會針對所有的children進行阻擋，canActivate只會對單一進行阻擋。

    data格式:
        acl:Array<string>權限(空值代表必通過)
        aclType:符合類型['all':全符合才通過]、['any':符合其一就通過(預設)]
        aclUrl:被阻擋後需要跳轉的頁面(可選)

```ts
import { AclGuard } from '@goldenapple/acl';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    // canActivateChild會針對所有的chieldre進行阻擋
    canActivateChild: [AclGuard],
    children: [
      // 沒有設定，不會進行阻擋
      { path: '', redirectTo: 'ManageStore', pathMatch: 'full' },
      {
        path: 'ManageStore',
        // 權限為'管理員'才能進入，失敗會跳轉到'/admin/login'
        data: { acl: ['管理員'], aclType: 'all', aclUrl: '/admin/login' },
        loadChildren: () => import('./page/manage-store/manage-store.module').then((m) => m.ManageStoreModule),
      },
    ],
  },
  {
    path: 'guest',
    // canActivate只會阻擋這個router，'訪客'才能進入
    canActivate: [AclGuard],
    data: { acl: ['訪客'], aclUrl: '/admin/login' },
    component: GuestComponent,
  },
];
```

## Service 使用

`用來設定使用者的權限`

    方法:
    setAcl(acl: string[]):設定權限 acl:['管理員','一般使用者','老闆']
    checkPermission(acl: string[], type: string = 'any'):檢查是否有權限 acl:['老闆','管理員'] type:符合類型['all':全符合才通過]、['any':符合其一就通過(預設)]

    變數:
    referrer:跳轉頁面，權限不足時會儲存當下頁面，可以用在登入後跳轉回權限不足的頁面。
    onChangeAcl:可訂閱，當權限發生變化時會觸發，訂閱後記得要取消訂閱。

```ts
export class LoginComponent {
  constructor(private router: Router, private aclService: AclService) {}
  async MyLoginApi(account, pw) {
    // TODO: 登入判斷，自己呼叫API去判斷吧
  }

  // 登入
  async submit(account, pw) {
    try {
      // 登入取得acl
      const { userAcl } = await MyLoginApi(account, pw);
      // 取得跳轉頁面
      const referrer = this.aclService.referrer;
      // 設定acl
      this.aclService.setAcl(userAcl);
      // 有要轉頁面則跳轉
      if (referrer) {
        this.router.navigateByUrl(referrer);
        // 跳轉後記得清空
        this.aclService.referrer = null;
      } else {
        // 沒有跳轉頁面，可以回首頁或是其他想去的地方
        // this.router.navigate(['/home']);
      }
    } catch {}
  }
}
```

## Directive 使用，需要搭配 Service 設定權限

`Directive搭配css，可以讓使用者更彈性，他會將沒有權限的元素加上一個叫no-permission的class，要隱藏還是disable都可以自行在css上設定`

    [acl]:權限設定 [aclType]:符合類型

```css
.no-permission {
  display: none !important;
}
```

```html
<!-- [acl]:權限設定 [aclType]:符合類型 -->
<a [acl]="['管理員','老闆']" [aclType]="'all'"> 這個連結只有'老闆'且'管理員'才看的到</a>
<a [acl]="['管理員','老闆']" [aclType]="'any'"> 這個連結'老闆'或'管理員'都看的到</a>
```
