import { NgModule } from '@angular/core';
import { AclService } from './acl.service';
import { AclDirective } from './acl.directive';
import { AclGuard } from './acl.guard';

@NgModule({
  declarations: [AclDirective],
  imports: [],
  providers: [AclService, AclGuard],
  exports: [AclDirective],
})
export class AclModule {}
