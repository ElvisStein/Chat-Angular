import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { BaseComponent } from 'src/app/shared/components/base.component';

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.scss']
})
export class ChatUsersComponent extends BaseComponent<User> implements OnInit {

  users$: Observable<User[]>;

  constructor(
    private userService: UserService
    ) {
      super();
     }

  ngOnInit() {
    this.users$ = this.userService.users$;
    // Se o a query não retornar nenhum valor (arrey vazio) a tela fica branca.
      // setTimeout(() => {
      //   this.users$ = of([]);
      // }, 3000);
  }

}
