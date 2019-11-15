import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';
import { UserProfileComponent } from './components/user-profile/user-profile.component';


@NgModule({
  declarations: [UserProfileComponent],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule { }
