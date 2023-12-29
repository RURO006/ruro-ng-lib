import { NgModule } from '@angular/core';
import { AclService } from './acl.service';
import { AclDirective, AclAutoDisableDirective, AclClassDirective } from './acl.directive';

@NgModule({
    declarations: [],
    imports: [],
    providers: [AclService],
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
