import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription, of } from 'rxjs';
import { map, mergeMap, tap, take } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { Chat } from '../../models/chat.model';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { BaseComponent } from 'src/app/shared/components/base.component';
import { ChatMessageComponent } from '../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent extends BaseComponent<Message> implements AfterViewInit, OnDestroy, OnInit {

  chat: Chat;
  messages$: Observable<Message[]>;
  newMessage = '';
  recipientId: string = null;
  alreadyLoadedMessages = false;  // Aula 200
  @ViewChild('content', {static: false}) private content: ElementRef;
  @ViewChildren(ChatMessageComponent) private messagesQueryList: QueryList<ChatMessageComponent>;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private title: Title,
    private userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.chatService.startChatMonitoring();
    this.userService.startUsersMonitoring(this.authService.authUser.id);
    this.title.setTitle('Loading...');
    this.subscriptions.push(
      this.route.data
        .pipe(
          map(routeData => this.chat = routeData.chat),
          mergeMap(() => this.route.paramMap),
          tap((params: ParamMap) => {
            if (!this.chat) {
              this.recipientId = params.get('id');

              this.userService.getUserById(this.recipientId)
                .pipe(take(1))
                .subscribe((user: User) => this.title.setTitle(user.name));

              this.messages$ = of([]);

              } else {
              this.title.setTitle(this.chat.title || this.chat.users[0].name);
              this.messages$ = this.messageService.getChatMessages(this.chat.id);
              this.alreadyLoadedMessages = true; // Aula 200
            }
          })
        )
        .subscribe()
    );
  }

  // Aula 208
  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.messagesQueryList.changes.subscribe(() => {
        this.scrollToBottom('smooth');
      })
    );
  }

  sendMessage(): void {
    this.newMessage = this.newMessage.trim();
    if (this.newMessage) {

      if (this.chat) {

        /* Criado um metodo para não deixar muito pluido o  "sendMessage"*/
        /*this.messageService.createMessage({
          text: this.newMessage,
          chatId: this.chat.id,
          senderId: this.authService.authUser.id
        }).pipe(take(1)).subscribe(console.log); */

        this.createMessage()
        .pipe(take(1)).subscribe();

        this.newMessage = '';

      } else {
        this.createPrivateChat();
      }

    }
  }

  /* Aula 200 */
  private createMessage(): Observable<Message> {
    return this.messageService.createMessage({
      text: this.newMessage,
      chatId: this.chat.id,
      senderId: this.authService.authUser.id
    }).pipe(
      tap(message => {
        if (!this.alreadyLoadedMessages) {
          this.messages$ = this.messageService.getChatMessages(this.chat.id);
          this.alreadyLoadedMessages = true;
        }
      })
    );
  }

  private createPrivateChat(): void {
    this.chatService.createPrivateChat(this.recipientId)
      .pipe(
        take(1),
        tap((chat: Chat) => {
          this.chat = chat;
          this.sendMessage();
        })
      ).subscribe();
  }

  // Aula 208 Metodo que faz o Scroll
  private scrollToBottom(behavior: string = 'auto', block: string = 'end'): void {
    setTimeout(() => {
      this.content.nativeElement.scrollIntoView({ behavior, block });
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.title.setTitle('Angular Graphcool Chat');
  }

}
