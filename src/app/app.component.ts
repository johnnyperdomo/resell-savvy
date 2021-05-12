import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavigationStart, Router } from '@angular/router';
//LATER: add error handling and red error responses

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'reseller-savvy';

  constructor(
    private router: Router,
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    //LATER: would be better to use a routeguard, instead of checking the url manually
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.checkUserSubscription();
      }
    });
  }

  //show paywall if not paying user
  checkUserSubscription() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        const subs = this.db
          .collection('users')
          .doc(user.uid)
          .collection('subscriptions');

        subs
          .get()
          .toPromise()
          .then(async (snap) => {
            if (snap.docs.length === 0) {
              //completely new user
              this.router.navigate(['/paywall']);
            } else {
              const trialingSubs = await subs.ref
                .where('status', '==', 'trialing')
                .get();
              const activeSubs = await subs.ref
                .where('status', '==', 'active')
                .get();

              if (trialingSubs.docs.length > 0 || activeSubs.docs.length > 0) {
                //active subscription

                if (this.router.url === '/paywall') {
                  //  this.router.navigate(['/inventory']);
                }
              } else {
                //needs to resubscribe
                this.router.navigate(['/paywall']);
              }
            }
          });
      }
    });
  }
}
