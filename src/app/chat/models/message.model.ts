import { Chat } from './chat.model';
import { User } from 'src/app/core/models/user.model';

export interface Message {
  id: string;
  text?: string;
  createdAt?: string;
  sender?: User;
  chat?: Chat;
}
