import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrosslistComponent } from './ui/crosslist/crosslist.component';
import { ListingConnectComponent } from './ui/listing-connect/listing-connect.component';
import { PopupComponent } from './ui/popup/popup.component';

const routes: Routes = [
  {
    path: 'popup',
    component: PopupComponent,
  },
  {
    path: 'crosslist',
    component: CrosslistComponent,
  },
  {
    path: 'listing-connect',
    component: ListingConnectComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
