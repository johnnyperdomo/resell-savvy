import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styles: ['./paywall.component.scss'],
})
export class PaywallComponent implements OnInit {
  //LATER: when we have our own custom payment solution instead of stripe checkout (like fomo.com), it will be easier to handle custom coupons like extending trial lengths and all that. For now it's very restrictive. For example, if they enter coupoon code, we can redeem it, update the trial length from 14 days to 30 days, and then charge them. Instead of having 7 day free trial + 30 days off.
  stripe = loadStripe(environment.stripe.publishableKey);

  subscriptionStatus: 'trial' | 'resubscribe';

  constructor(private db: AngularFirestore, private auth: AngularFireAuth) {}

  ngOnInit(): void {
    this.checkUserSubscription();
  }

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
              this.subscriptionStatus = 'trial';
              console.log(this.subscriptionStatus);
            } else {
              const trialingSubs = await subs.ref
                .where('status', '==', 'trialing')
                .get();
              const activeSubs = await subs.ref
                .where('status', '==', 'active')
                .get();

              if (trialingSubs.docs.length > 0 || activeSubs.docs.length > 0) {
              } else {
                //needs to resubscribe
                this.subscriptionStatus = 'resubscribe';
                console.log(this.subscriptionStatus);
              }
            }
          });
      }
    });
  }

  onStripeCheckout(useCoupon: boolean) {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        let docRef: any;

        try {
          if (this.subscriptionStatus == 'trial') {
            //new trial

            if (useCoupon === true) {
              docRef = await this.db
                .collection('users')
                .doc(user.uid)
                .collection('checkout_sessions')
                .add({
                  price: environment.stripe.priceId,
                  success_url: `${window.location.origin}/getting-started`,
                  cancel_url: `${window.location.origin}/paywall`,
                  allow_promotion_codes: true,
                  trial_from_plan: false,
                });
            } else {
              docRef = await this.db
                .collection('users')
                .doc(user.uid)
                .collection('checkout_sessions')
                .add({
                  price: environment.stripe.priceId,
                  success_url: `${window.location.origin}/getting-started`,
                  cancel_url: `${window.location.origin}/paywall`,
                  allow_promotion_codes: false,
                  //don't use item trial here, because we are offering 30 day trial coupons, and stripe checkout doesn't let me extend trial, so to avoid 14 + 30 day trial. I just eliminate the trial, and just do the 30 day trial.
                  //LATER: when i make custom paywall with custom checkout, i can custom coupon configuration more.
                });
            }
          } else {
            //resubscribe

            if (useCoupon === true) {
              docRef = await this.db
                .collection('users')
                .doc(user.uid)
                .collection('checkout_sessions')
                .add({
                  price: environment.stripe.priceId,
                  success_url: `${window.location.origin}/getting-started`,
                  cancel_url: `${window.location.origin}/paywall`,
                  allow_promotion_codes: true,
                  trial_from_plan: false,
                });
            } else {
              docRef = await this.db
                .collection('users')
                .doc(user.uid)
                .collection('checkout_sessions')
                .add({
                  price: environment.stripe.priceId,
                  success_url: `${window.location.origin}/getting-started`,
                  cancel_url: `${window.location.origin}/paywall`,
                  allow_promotion_codes: false,
                  trial_from_plan: false,
                });
            }
          }

          // Wait for the CheckoutSession to get attached by the extension
          docRef.onSnapshot(async (snap) => {
            const { error, sessionId } = snap.data();
            if (error) {
              // Show an error to your customer and
              // inspect your Cloud Function logs in the Firebase console.
              alert(`An error occured: ${error.message}`);
            }

            if (sessionId) {
              // We have a session, let's redirect to Checkout
              // Init Stripe
              console.log('session id exists');

              (await this.stripe).redirectToCheckout({ sessionId });
            }
          });
        } catch (error) {
          alert(error);
        }
      }
    });
    console.log('stripe checkout');
  }
}
