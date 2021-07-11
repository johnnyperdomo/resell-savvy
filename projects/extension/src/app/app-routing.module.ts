import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImportComponent } from './ui/import/import.component';
import { ListingConnectComponent } from './ui/listing-connect/listing-connect.component';
import { PopupComponent } from './ui/popup/popup.component';

const routes: Routes = [
  {
    path: 'popup',
    component: PopupComponent,
  },
  {
    path: 'import',
    component: ImportComponent,
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
