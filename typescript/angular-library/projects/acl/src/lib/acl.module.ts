import { NgModule } from '@angular/core';
import { AclService } from './acl.service';
import {
  AclDirective,
  AclAutoDisableDirective,
  AclClassDirective,
} from './acl.directive';
import { AclGuard } from './acl.guard';

@NgModule({
  declarations: [],
  imports: [],
  providers: [AclService, AclGuard],
  exports: [],
})
export class AclModule {}

@NgModule({
  declarations: [AclDirective, AclAutoDisableDirective, AclClassDirective],
  imports: [],
  providers: [],
  exports: [AclDirective, AclAutoDisableDirective, AclClassDirective],
})
export class AclDirectiveModule {}
