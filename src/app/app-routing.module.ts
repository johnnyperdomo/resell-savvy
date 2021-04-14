import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ItemComponent } from './item/item.component';
import { PageNotFoundComponent } from './misc/page-not-found/page-not-found.component';
import { AccountComponent } from './settings/account/account.component';
import { BillingComponent } from './settings/billing/billing.component';
import { SettingsComponent } from './settings/settings.component';
import {
  AngularFireAuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { GettingStartedComponent } from './getting-started/getting-started.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']); //if no logged in, restrict access
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['inventory']); //if logged in, block auth

//TODO: add pipe guards for logged in states
const routes: Routes = [
  //Main
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },

  //Auth
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },

  {
    path: 'inventory',
    component: InventoryComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },

  {
    path: 'getting-started',
    component: GettingStartedComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },

  {
    path: 'item/new',
    component: ItemComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  }, //new item

  {
    path: 'item/:id/edit',
    component: ItemComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  }, //edit item

  //Settings
  {
    path: 'settings',
    redirectTo: 'settings/account',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  }, //redirects to settings/integrations

  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [
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
