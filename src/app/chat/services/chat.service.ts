import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { DataProxy } from 'apollo-cache';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { BaseService } from './base.service';
import {
  CHAT_BY_ID_OR_BY_USERS_QUERY,
  CREATE_PRIVATE_CHAT_MUTATION,
  USER_CHATS_QUERY,
  USER_CHATS_SUBSCRIPTION,
  AllChatsQuery,
  ChatQuery,
  CREATE_GROUP_MUTATION
} from './chat.graphql';
import { GET_CHAT_MESSAGES_QUERY, USER_MESSAGES_SUBSCRIPTION, AllMessagesQuery } from './message.graphql';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends BaseService {

  // aula 204 - Monitoramento de lista de chats
  chats$: Observable<Chat[]>;
  // aula 2018 - Exibindo ultima msg dos chats em tempo real
  private queryRef: QueryRef<AllChatsQuery>;
  // Aula 205
  private subscriptions: Subscription[] = [];

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    super();
  }

  // Aula 204
  startChatMonitoring(): void {
    if (!this.chats$) { // So vai realizar o comando a baixo se ainda não tiver sido atribuido nada ao chats$
      this.chats$ = this.getUserChats();
      // this.chats$.subscribe();
      // Aula 205
      this.subscriptions.push(this.chats$.subscribe());
      this.subscriptions.push(
        this.router.events.subscribe((event: RouterEvent) => {
          if (event instanceof NavigationEnd && !this.router.url.includes('chat')) {
            this.stopChatsMonitoring();
            this.userService.stopUsersMonitoring();
          }
        })
      );
    }
  }

  // aula 228
  private stopChatsMonitoring(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    this.chats$ = null;
  }

  // Query que monitora a lista de chat (porem sem o auto Refresh) sem o watchQuery
  /* getUserChats(): Observable<Chat[]> {
    return this.apollo.query<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        loggedUserId: this.authService.authUser.id
      }
    }).pipe(
      map(res => res.data.allChats),
      // Ordenando os chats por data da ultima msg
      map((chats: Chat[]) => {
        const chatsToSort = chats.slice();
        return chatsToSort.sort((a, b) => {
          const valueA = (a.messages.length > 0) ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
          const valueB = (b.messages.length > 0) ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
          return valueB - valueA;
        });
      })
    );
  } */

  // // Query que monitora a lista de chat com o watchQuery
  // getUserChats(): Observable<Chat[]> {
  //   return this.apollo.watchQuery<AllChatsQuery>({
  //     query: USER_CHATS_QUERY,
  //     variables: {
  //       loggedUserId: this.authService.authUser.id
  //     }
  //   }).valueChanges
  //     .pipe(
  //       map(res => res.data.allChats),
  //       // Ordenando os chats por data da ultima msg
  //       map((chats: Chat[]) => {
  //         const chatsToSort = chats.slice();
  //         return chatsToSort.sort((a, b) => {
  //           const valueA = (a.messages.length > 0) ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
  //           const valueB = (b.messages.length > 0) ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
  //           return valueB - valueA;
  //         });
  //       })
  //     );
  // }

  // Aula 218 - Query que monitora a lista de chat com o watchQuery e Exibindo ultima msg dos chats em tempo real
  getUserChats(): Observable<Chat[]> {
    this.queryRef = this.apollo.watchQuery<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        loggedUserId: this.authService.authUser.id
      },
      fetchPolicy: 'network-only'
    });
    // Aula 224
    this.queryRef.subscribeToMore({
      document: USER_CHATS_SUBSCRIPTION,
      variables: { loggedUserId: this.authService.authUser.id },
      updateQuery: (previous: AllChatsQuery, { subscriptionData }): AllChatsQuery => {

        const newChat: Chat = subscriptionData.data.Chat.node;

        if (previous.allChats.every(chat => chat.id !== newChat.id)) {
          return {
            ...previous,
            allChats: [newChat, ...previous.allChats]
          };
        }

        return previous;
      }
    });

    this.queryRef.subscribeToMore({
      document: USER_MESSAGES_SUBSCRIPTION,
      variables: { loggedUserId: this.authService.authUser.id },
      updateQuery: (previous: AllChatsQuery, { subscriptionData }): AllChatsQuery => {

        const newMessage: Message = subscriptionData.data.Message.node;

        try {

          if (newMessage.sender.id !== this.authService.authUser.id) {
            const apolloCliente = this.apollo.getClient();

            const chatMessageVariables = { chatId: newMessage.chat.id };

            const chatMessagesData = apolloCliente.readQuery<AllMessagesQuery>({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessageVariables
            });

            chatMessagesData.allMessages = [...chatMessagesData.allMessages, newMessage];

            apolloCliente.writeQuery({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessageVariables,
              data: chatMessagesData
            });
          }

        } catch (e) {
          console.log('allMessagesQuery not found!');
        }


        const chatToUpdateIndex: number =
        (previous.allChats)
          ? previous.allChats.findIndex(chat => chat.id === newMessage.chat.id)
          : -1;

        if (chatToUpdateIndex > -1) {
          const newAllChats = [...previous.allChats];
          const chatToUpdate: Chat = Object.assign({}, newAllChats[chatToUpdateIndex]);
          chatToUpdate.messages = [newMessage];
          newAllChats[chatToUpdateIndex] = chatToUpdate;
          return {
            ...previous,
            allChats: newAllChats
          };
        }

        return previous;
      }
    });

    return this.queryRef.valueChanges
      .pipe(
        map(res => res.data.allChats),
        // Ordenando os chats por data da ultima msg
        map((chats: Chat[]) => {
          const chatsToSort = chats.slice();
          return chatsToSort.sort((a, b) => {
            const valueA = (a.messages.length > 0) ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
            const valueB = (b.messages.length > 0) ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
            return valueB - valueA;
          });
        }), // Ordenação da lista de chats
        map(chats => chats.map(c => {
          const chat = new Chat(c);
          chat.users = chat.users.map(u => new User(u));
          return chat;
        }))
      );
  }

  getChatByIdByUsers(chatOrUserId: string): Observable<Chat> {
    return this.apollo.query<ChatQuery | AllChatsQuery>({
      query: CHAT_BY_ID_OR_BY_USERS_QUERY,
      variables: {
        chatId: chatOrUserId,
        loggedUserId: this.authService.authUser.id,
        targetUserId: chatOrUserId
      }
    }).pipe(
      // tslint:disable-next-line:no-string-literal
      map(res => (res.data['Chat']) ? res.data['Chat'] : res.data['allChats'][0])
    );
  }

  createPrivateChat(targetUserId: string): Observable<Chat> {
    return this.apollo.mutate({
      mutation: CREATE_PRIVATE_CHAT_MUTATION,
      variables: {
        loggedUserId: this.authService.authUser.id,
        targetUserId
      },
      /* Aula 201 - Correção da query feita na aula passada que deixava o cach da createPrivateChat como null, apos a criação do chat */
      update: (store: DataProxy, { data: { createChat } }) => {

        // // Aula 203 Atualizando o cache após criar um novo chat
        // const userChatsVariables = { loggedUserId: this.authService.authUser.id };
        // // lé os dados do cach
        // const userChatsData = store.readQuery<AllChatsQuery>({
        //   query: USER_CHATS_QUERY,
        //   variables: userChatsVariables
        // });
        // /* altera os dados do cach com o:
        //  "createChat"(Ultimo chat criado),
        //  completando com o
        //  "...userChatsData.allChats"(Os chats que ja estavam na lista a baixo) */
        // userChatsData.allChats = [createChat, ...userChatsData.allChats];
        // // Escreve esses dados
        // store.writeQuery({
        //   query: USER_CHATS_QUERY,
        //   variables: userChatsVariables,
        //   data: userChatsData
        // });

        // Aula 254 - Utilizando o BaseService para usar a query a cima de forma
        this.readAndWriteQuery<Chat>({
          store,
          newRecord: createChat,
          query: USER_CHATS_QUERY,
          queryName: 'allChats',
          arrayOperation: 'unshift',
          variable: { loggedUserId: this.authService.authUser.id }
        });

        // // Feito na aula 201 VVVVV
        // const variables = {
        //   chatId: targetUserId,
        //   loggedUserId: this.authService.authUser.id,
        //   targetUserId
        // };

        // const data = store.readQuery<AllChatsQuery>({
        //   query: CHAT_BY_ID_OR_BY_USERS_QUERY,
        //   variables
        // });

        // data.allChats = [createChat];

        // store.writeQuery({
        //   query: CHAT_BY_ID_OR_BY_USERS_QUERY,
        //   variables,
        //   data
        // });

        this.readAndWriteQuery<Chat>({
          store,
          newRecord: createChat,
          query: CHAT_BY_ID_OR_BY_USERS_QUERY,
          queryName: 'allChats',
          arrayOperation: 'singleRecord',
          variable: {
            chatId: targetUserId,
            loggedUserId: this.authService.authUser.id,
            targetUserId
          }
        });

      }
    }).pipe(
      map(res => res.data.createChat)
    );
  }

  // Aula 248
  createGroup(variables: {title: string, usersIds: string[], photoId: string}): Observable<Chat> {

    variables.usersIds.push(this.authService.authUser.id);

    return this.apollo.mutate({
      mutation: CREATE_GROUP_MUTATION,
      variables: {
        ...variables,
        loggedUserId: this.authService.authUser.id
      },
      optimisticResponse: {
        __typename: 'mutation',
        createChat: {
          __typename: 'Chat',
          id: '',
          title: variables.title,
          createdAt: new Date().toISOString(),
          isGroup: true,
          photo: {
            __typename: 'File',
            id: '',
            secret: ''
          },
          users: [
            {
              __typename: 'User',
              id: '',
              name: '',
              email: '',
              createdAt: new Date().toISOString(),
              photo: {
                __typename: 'File',
                id: '',
                secret: ''
              }
            }
          ],
          messages: []
        }
      },
      update: (store: DataProxy, { data: { createChat } }) => {

        // const userChatsVariables = { loggedUserId: this.authService.authUser.id };

        // const userChatsData = store.readQuery<AllChatsQuery>({
        //   query: USER_CHATS_QUERY,
        //   variables: userChatsVariables
        // });

        // userChatsData.allChats = [createChat, ...userChatsData.allChats];

        // store.writeQuery({
        //   query: USER_CHATS_QUERY,
        //   variables: userChatsVariables,
        //   data: userChatsData
        // });

        this.readAndWriteQuery<Chat>({
          store,
          newRecord: createChat,
          query: USER_CHATS_QUERY,
          queryName: 'allChats',
          arrayOperation: 'unshift',
          variable: { loggedUserId: this.authService.authUser.id }
        });

      }
    }).pipe(
      map(res => res.data.createChat)
    );
  }

}


/*
  root
    ChatModule
*/
