import { Message } from './message.model';
import { User } from 'src/app/core/models/user.model';
import { FileModel } from 'src/app/core/models/file.model';

import { graphcoolConfig } from './../../core/providers/graphcool-config.provider';

export class Chat {
  // todos campos seram opcionais
  id: string;
  createdAt?: string;
  isGroup?: boolean;
  title?: string;
  users?: User[];
  messages?: Message[];
  photo?: FileModel; // Aula 305 - Implementando o construtor e novo método no ChatModel

  constructor(chat: Chat) {
    Object.keys(chat)
    .forEach(key => this[key] = chat[key]);
  }

  // Aula 305 - Implementando o construtor e novo método no ChatModel
  getPhotoURL?(): string {
    if (this.photo && this.photo.secret) { // Se tiver uma foto monta a URL pra acessar a foto
      return `${graphcoolConfig.fileDownloadURL}/${this.photo.secret}`;
    }
    if (this.isGroup) { // Se não tiver foto verifica se é um grupo
      return 'assets/images/group-no-photo.png';
    }
    return this.users[0].getPhotoURL() || 'assets/images/user-no-photo.png'; // Se o chat não for um grupo. Será um chat privado
  }

}
