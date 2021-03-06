import gql from 'graphql-tag';

import { Chat } from '../models/chat.model';
import { FileFragment } from 'src/app/core/services/file.graphql';

export interface AllChatsQuery {
  Chat: any;
  Message: any;
  allChats: Chat[];
}

export interface ChatQuery {
  Chat: Chat;
}

const ChatFragment = gql`
  fragment ChatFragment on Chat {
    id
    title
    createdAt
    isGroup
    users(
      first: 1,
      filter: {
        id_not: $loggedUserId
      }
    ) {
      id
      name
      email
      createdAt
      photo {
        ...FileFragment
      }
    }
  }
  ${FileFragment}
`;

const ChatMessagesFragment = gql`
  fragment ChatMessagesFragment on Chat {
    messages(
      last: 1
    ) {
      id
      createdAt
      text
      sender {
        id
        name
      }
    }
  }
`;

/* A explicação sobre como funciona a Fragment esta em
  core/services/user.graphql */
export const USER_CHATS_QUERY = gql`
  query UserChatsQuery($loggedUserId: ID!) {
    allChats(
      filter: {
        users_some: {
          id: $loggedUserId
        }
      }
    ) {
      ...ChatFragment
      ...ChatMessagesFragment
    }
  }
  ${ChatFragment}
  ${ChatMessagesFragment}
`;

// Query vai verificar se existe um chat com o id que for passado ou se existe um chat com 2 id que passaremos
// ($chatId)= Id do chat, ($loggedIdUser)= Id de quem esta logado, ($targetUserId)= Id do usuario com quem esta tentando conversar
export const CHAT_BY_ID_OR_BY_USERS_QUERY = gql`
  query ChatByIdOrByUsersQuery($chatId: ID!, $loggedUserId: ID!, $targetUserId: ID!) {
    Chat(
      id: $chatId
    ) {
      ...ChatFragment
    }
    allChats(
      filter: {
        AND: [
          { users_some: { id: $loggedUserId } },
          { users_some: { id: $targetUserId } }
        ],
        isGroup: false
      }
    ) {
      ...ChatFragment
    }
  }
  ${ChatFragment}
`;

export const CREATE_PRIVATE_CHAT_MUTATION = gql`
  mutation CreatePrivateChatMutation($loggedUserId: ID!, $targetUserId: ID!) {
    createChat(
      usersIds: [
        $loggedUserId,
        $targetUserId
      ]
    ) {
      ...ChatFragment
      ...ChatMessagesFragment
    }
  }
  ${ChatFragment}
  ${ChatMessagesFragment}
`;

// Aula 247 - Mutation para criar grupos no GraphQL
export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroupMutation($title: String!, $usersIds: [ID!]!, $loggedUserId: ID!, $photoId: ID) {
    createChat(
      title: $title,
      usersIds: $usersIds,
      isGroup: true
      photoId: $photoId
    ) {
      ...ChatFragment
      ...ChatMessagesFragment
    }
  }
  ${ChatFragment}
  ${ChatMessagesFragment}
`;

// Aula 224 - Atualizando a lista de chats do usuario com o subscription Data
export const USER_CHATS_SUBSCRIPTION = gql`
  subscription UserChatsSubscription($loggedUserId: ID!) {
    Chat(
      filter: {
        mutation_in: [ CREATED, UPDATED ],
        node: {
          users_some: {
            id: $loggedUserId
          }
        }
      }
    ) {
      mutation
      node {
        ...ChatFragment
        ...ChatMessagesFragment
      }
    }
  }
  ${ChatFragment}
  ${ChatMessagesFragment}
`;
