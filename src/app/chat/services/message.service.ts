import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataProxy } from 'apollo-cache';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AllMessagesQuery,
  GET_CHAT_MESSAGES_QUERY,
  CREATE_MESSAGE_MUTATION
} from './message.graphql';
import { Message } from '../models/message.model';
import { AllChatsQuery, USER_CHATS_QUERY } from './chat.graphql';
import { AuthService } from 'src/app/core/services/auth.service';
import { BaseService } from './base.service';
import { User } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService extends BaseService {

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) {
    super();
   }

  getChatMessages(chatId: string): Observable<Message[]> {
    // Aula 197 aprendendo a usar as watchQuery
    return this.apollo.watchQuery<AllMessagesQuery>({
      query: GET_CHAT_MESSAGES_QUERY,
      variables: { chatId },
      fetchPolicy: 'network-only'
    }).valueChanges
      .pipe(
        map(res => res.data.allMessages),
        map(messages => messages.map(m => {
          const message = Object.assign({}, m);
          message.sender = new User(message.sender);
          return message;
        }))
      );
        // Antes estava este codigo porem não trabalhava com o whatchQuery(faz o alto refresh da aplicação)
      // return this.apollo.query<AllMessagesQuery>({
      //   query: GET_CHAT_MESSAGES_QUERY,
      //   variables: { chatId }
      // }).pipe(
      //   map(res => res.data.allMessages)
      // );
  }

  createMessage(message: {text: string, chatId: string, senderId: string}): Observable<Message> {
    return this.apollo.mutate({
      mutation: CREATE_MESSAGE_MUTATION,
      variables: message,
      // Aula 199 Otimizando o tempo de exibição na tela.
      /* A msg aparece instantaneamente pro usuário pos o apollo preenche os campos com os dados que ele recebe enquanto
          enquanto o dado real esta sendo enviado ao servidor e sera retornado a aplicação. Apos a aplicação receber as
          informações corretas (id, createdAt...) o apollo subistitui os dados que ele fez por conta propria e coloca no
          lugar os dados do servidor */
      optimisticResponse: {
        __typename: 'Mutation',
        createMessage: {
          __typename: 'Message',
          id: '',
          text: message.text,
          createdAt: new Date().toISOString(),
          sender: {
            __typename: 'User',
            id: message.senderId,
            name: '',
            email: '',
            createdAt: '',
            photo: {
              __typename: 'File',
              id: '',
              secret: this.authService.authUser.photo && this.authService.authUser.photo.secret || ''
            }
          },
          chat: {
            __typename: 'Chat',
            id: message.chatId
          }
        }
      },
      // Aula 198
      // Fazendo a leitura da query direto do cach do apollo
      update: (store: DataProxy, {data: { createMessage }}) => {

        // /* Na aula 200 foi atrubuido um try catch, para que no momento em que
        //     em que for criado um chat novo pare o erro que estava dando no cach do apollo */
        // try {
        //   const data = store.readQuery<AllMessagesQuery>({
        //     query: GET_CHAT_MESSAGES_QUERY,
        //     variables: { chatId: message.chatId }
        //   });
        //   // Fim da leitura
        //   // Lê a query e acrescenta um novo item na lista
        //   data.allMessages = [...data.allMessages, createMessage];

        //   // Depois escrevendo a a lista de volta ao cach do apollo.
        //   store.writeQuery({
        //     query: GET_CHAT_MESSAGES_QUERY,
        //     variables: { chatId: message.chatId },
        //     data
        //   });
        // } catch (e) {
        //   console.log('allMessagesQuery not found');
        // }

        this.readAndWriteQuery<Message>({
          store,
          newRecord: createMessage,
          query: GET_CHAT_MESSAGES_QUERY,
          queryName: 'allMessages',
          arrayOperation: 'push',
          variable: { chatId: message.chatId }
        });


        // Aula 206
        try {

          const userChatsVariables = { loggedUserId: this.authService.authUser.id };

          const userChatsData = store.readQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables
          });

          const newUserChatsList = [...userChatsData.allChats];

          newUserChatsList.map(c => {
            if (c.id === createMessage.chat.id) {
              c.messages = [createMessage];
            }
            return c;
          });

          userChatsData.allChats = newUserChatsList;

          store.writeQuery({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables,
            data: userChatsData
          });

        } catch (e) {
          console.log(`Query allChats not found in cache!`);
        }

      }
    }).pipe(
      map(res => res.data.createMessage)
    );
  }

}
