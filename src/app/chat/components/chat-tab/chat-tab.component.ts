import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-chat-tab',
  template: `
    <nav mat-tab-nav-bar backgroudColor="primary">

      <a mat-tab-link
        routerLink="./"
        routerLinkActive
        #chatsRla="routerLinkActive"
        [active]="chatsRla.isActive"
        [routerLinkActiveOptions]="{exact: true}">
        Conversas
      </a>

      <a mat-tab-link
        routerLink="users"
        routerLinkActive
        #usersRla="routerLinkActive"
        [active]="usersRla.isActive">
          Usuários
      </a>

    </nav>

    <router-outlet></router-outlet>
  `,
  styles: []
})
export class ChatTabComponent implements OnInit {
  // aula 204
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.chatService.startChatMonitoring();
    this.userService.startUsersMonitoring(this.authService.authUser.id);
  }

}
