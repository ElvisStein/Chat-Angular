import { FileModel } from './file.model';
import { graphcoolConfig } from './../providers/graphcool-config.provider';

export class User {

  // Usado para armazenar os dado recuperados do graphcool é enviado pro core/services/user.graphql.ts onde pela query recebe um valor
  // Tambem é usado pelo chat-users.component.html para exibir o valor na aplicação
  id: string;
  name?: string;
  email?: string;
  createdAt?: string;
  photo?: FileModel;

  constructor(user: User) {
    Object.keys(user)
      .forEach(key => this[key] = user[key]);
  }

  getPhotoURL?(): string {
    return (this.photo && this.photo.secret)
      ? `${graphcoolConfig.fileDownloadURL}/${this.photo.secret}`
      : 'assets/images/user-no-photo.png';
  }

}
