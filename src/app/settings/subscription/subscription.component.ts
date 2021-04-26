import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit {
  //LATER: add loading progress
  constructor() {}

  ngOnInit(): void {}

  async onCreateBillingPortalSession() {
    console.log('called session fetch');

    //LATER: disable button when clicked to prevent spamming.
    //LATER: instead of having billing portal, just have all the billing info on this page.

    const portalSessionCallable = firebase.default
      .functions()
      .httpsCallable('createBillingPortalSession');

    try {
      let portalSession = await portalSessionCallable({});
      const portalURL = portalSession.data.url;

      window.open(portalURL);

      return portalSession;
    } catch (err) {
      alert(
        'Problem connecting to stripe, please try again. Error: ' + err.error
      );
    }
  }
}
