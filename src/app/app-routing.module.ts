import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './login/auth.guard';

// O angular trabalha primeiro colocar as rotas mais especificas
// e por ultimo as mas genericas, pois o rotiador do angular trabalha com a primeira ocorencia que ela encontra
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canLoad: [ AuthGuard ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, /*{ enableTracing: true }*/)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
