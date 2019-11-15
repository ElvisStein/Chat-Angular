import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-dashboard-resources',
  template: `
    <mat-nav-list>

      <a mat-list-item
      [routerLink]="link.url"
      *ngFor="let link of resources"
      (click)="onClose()">
        <mat-icon matListIcon>{{ link.icon }}</mat-icon>
        <h3 matLine>{{ link.title }}</h3>
      </a>

      <ng-content></ng-content>

    </mat-nav-list>
  `
})
export class DashboardResourcesComponent implements OnInit {

  @Input() isMenu = false;
  // tslint:disable-next-line:no-output-native
  @Output() close = new EventEmitter<void>();

  resources: any[] = [
    {
      url: '/dashboard/chat', // sufixo da url
      icon: 'chat_bubble', // nome do icone baseado Angular Material
      title: 'Minhas Conversas'
    },
    {
      url: '/dashboard/chat/users', // sufixo da url
      icon: 'people', // nome do icone baseado Angular Material
      title: 'Todos Usuários'
    },
    {
      url: '/dashboard/profile', // sufixo da url
      icon: 'person', // nome do icone baseado Angular Material
      title: 'Perfil'
    }
  ];

  ngOnInit(): void {
    if (this.isMenu) {
      this.resources.unshift({
      url: '/dashboard', // sufixo da url
      icon: 'home', // nome do icone baseado Angular Material
      title: 'Home'
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

}
