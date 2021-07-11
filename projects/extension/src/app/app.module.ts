import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PopupComponent } from './ui/popup/popup.component';
import { ImportComponent } from './ui/import/import.component';
import { ListingConnectComponent } from './ui/listing-connect/listing-connect.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { PopupSigninComponent } from './ui/popup/popup-signin/popup-signin.component';
import { PopupDashboardComponent } from './ui/popup/popup-dashboard/popup-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    ImportComponent,
    ListingConnectComponent,
    PopupSigninComponent,
    PopupDashboardComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [
    // This is needed because the manifest loads the index.html file, followed by a #,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
