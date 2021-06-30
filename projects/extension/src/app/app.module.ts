import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PopupComponent } from './ui/popup/popup.component';
import { CrosslistComponent } from './ui/crosslist/crosslist.component';
import { ListingConnectComponent } from './ui/listing-connect/listing-connect.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    CrosslistComponent,
    ListingConnectComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    // This is needed because the manifest loads the index.html file, followed by a #,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}