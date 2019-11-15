import { Component, OnInit, Input } from '@angular/core';

import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input() message: Message;
  // Vai dizer se a msg esta sendo enviada ou se esta recebendo
  @Input() isFromSender: boolean;
  // Colocara uma seta indicando uma direção e posicionará a msg em um canto(direita=Enviando; esquerda=Recebendo)
  arrowClass = {};

  ngOnInit() {
    this.arrowClass = {
      // Seta para esquerda se não foi voce que enviou
      'arrow-left': !this.isFromSender,
      // Seta direita se foi voce que enviou.
      'arrow-right': this.isFromSender
    };
  }

}
