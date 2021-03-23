import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ItemComponent } from './item/item.component';
import { PageNotFoundComponent } from './misc/page-not-found/page-not-found.component';
import { AccountComponent } from './settings/account/account.component';
import { BillingComponent } from './settings/billing/billing.component';
import { IntegrationsComponent } from './settings/integrations/integrations.component';
import { SettingsComponent } from './settings/settings.component';

//TODO: add pipe guards for logged in states
const routes: Routes = [
  //Auth
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },

  { path: 'dashboard', component: DashboardComponent },

  //Main
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'item/new',
    component: ItemComponent,
  }, //new item

  {
    path: 'item/:id/edit',
    component: ItemComponent,
  }, //edit item

  //Settings
  {
    path: 'settings',
    redirectTo: 'settings/integrations',
  }, //redirects to settings/integrations

  {
    path: 'settings',
    component: SettingsComponent,
    children: [
      { path: 'integrations', component: IntegrationsComponent },
      { path: 'account', component: AccountComponent },
      { path: 'billing', component: BillingComponent },
    ],
  },

  //404 - Page not found
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
