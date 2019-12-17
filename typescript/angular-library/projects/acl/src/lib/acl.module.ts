import { NgModule } from '@angular/core';
import { AclService } from './acl.service';
import { AclDirective } from './acl.directive';
import { AclGuard } from './acl.guard';

@NgModule({
  declarations: [],
  imports: [],
  providers: [AclService, AclGuard],
  exports: [],
})
export class AclModule {}

@NgModule({
  declarations: [AclDirective],
  imports: [],
  providers: [],
  exports: [AclDirective]
})
export class AclDirectiveModule {}
