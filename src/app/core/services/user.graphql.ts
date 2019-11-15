import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { FileFragment } from './file.graphql';
import { User } from '../models/user.model';

// arquivo paraguardar as query e mutation e subscraption

export interface AllUsersQuery {
  User: any;
  allUsers: User[];
}

export interface UserQuery {
  User: User;
}
/*  Utilizar o Fragment para subistituiar o codigo que fica se repetindo a baixo
    fragment(palavra rezervada)
    UserFragment(nome do fragment estamos usando o mesmo nome da constante)
    on (em qual tipo sera feito a seleção de campos)
    User (tipo onde sera feito a seleção)
*/
const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
    createdAt
    photo {
      ...FileFragment
    }
  }
  ${FileFragment}
`;

// Query lida do Graphcool e enviada para o chat-users.component para ser exibido
/* Atés a const AL_QUERY e GET_USER_BY_ID_QUERY utilizavam como parametros:
    id
    name
    email
    createdAt
  Em ambas para evitar a repetição utilizaremos o novo Fragment.
  Para usar o Fragment utiliza-se "..." antes do nome da const
  E para que a Query consiga receber os dados id,email... deve ser
  inserido ao fim da query o "${Nome do Fragment}" */
export const ALL_USERS_QUERY = gql`
  query AllUsersQuery($idToExclude: ID!) {
    allUsers(
      orderBy: name_ASC,
      filter: {
        id_not: $idToExclude
      }
    ) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const GET_USER_BY_ID_QUERY = gql`
  query GetUserByIdQuery($userId: ID!) {
    User(id: $userId) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($id: ID!, $name: String!, $email: String!) {
  updateUser(
    id: $id,
    name: $name,
    email: $email
  ) {
    ...UserFragment
  }
}
${UserFragment}
`;

const updateUserPhotoMutation = `
  updateUser(id: $loggedUserId, photoId: $newPhotoId) {
    ...userFragment
  }
`;

const deleteFileMutation = `
  deleteFile(id: $oldPhotoId) {
    id
    secret
  }
`;

export const getUpdateUserPhotoMutation = (hasOldPhoto: boolean) => {
  if (hasOldPhoto) {
    return gql`
      mutation UpdatedAndDeleteUserPhoto($loggedUserId: ID!, $newPhotoId: ID!, $oldPhotoId: ID!) {
        ${updateUserPhotoMutation}
        ${deleteFileMutation}
      }
      ${UserFragment}
    `;
  }
  return gql`
    mutation UpdatedAndDeleteUserPhoto($loggedUserId: ID!, $newPhotoId: ID!) {
      ${updateUserPhotoMutation}
    }
    ${UserFragment}
  `;
};

// Aula 226 - Atuaizando lista de usuarios em tempo real com Subscription
export const USERS_SUBSCRIPTION = gql`
  subscription UsersSubscription {
    User(
      filter: {
        mutation_in: [ CREATED, UPDATED ]
      }
    ) {
      mutation
      node {
        ...UserFragment
      }
    }
  }
  ${UserFragment}
`;
