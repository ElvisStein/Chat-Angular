import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../login/auth.guard';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatTabComponent } from './components/chat-tab/chat-tab.component';
import { ChatUsersComponent } from './components/chat-users/chat-users.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ChatWindowResolver } from './components/chat-window/chat-window.resolver';


// Quando o usuario acessar o /dashboard/chat e se apos apos o ".../chat/''/''" ('')um diretorio vazio
 // o usuario vai cair no proprio diretorio /dashboard/chat
  // Ou seja sera exibido junto ao diretorio de chats a lista de chats
const routes: Routes = [
  {
    path: '',
    component: ChatTabComponent,
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
    children: [
      { path: 'users', component: ChatUsersComponent },
      { path: '', component: ChatListComponent}
    ]
  },  // o parametro para rota é um "seguimento de variavel"(:)+(id) a variavel que utilizaremos depois digo qual component sera renderizado
  { path: ':id',
    component: ChatWindowComponent,
    canActivate: [ AuthGuard ],
    resolve: { chat: ChatWindowResolver }
  }
];
  /*    /dashboard/chat/:id
    ex: /dashboard/chat/njnweclxmsalxmne*/

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ ChatWindowResolver ]
})
export class ChatRoutingModule { }
