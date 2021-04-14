import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-pricing-modal',
  templateUrl: './pricing-modal.component.html',
  styleUrls: ['./pricing-modal.component.scss'],
})
//TODO: add the live stripe prices on production
export class PricingModalComponent implements OnInit {
  isLoading: boolean;

  isSubscribed: Boolean; //TODO: hide or show alert based on if user is subscribed or not.

  docRef: DocumentReference;

  constructor(private db: AngularFirestore, private auth: AngularFireAuth) {}

  ngOnInit(): void {
    //TODO: is subscribed, check if exists for new user, or check if they can find any active.
  }

  async onStartProPlan() {
    this.isLoading = true;
    console.log('onstartproplan');

    this.docRef = await this.db
      .collection('users')
      .doc((await this.auth.currentUser).uid)
      .collection('checkout_sessions')
      .add({
        price: 'price_1IYFIdKWbAZBgyTQ0EqAaGuB',
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });
    // Wait for the CheckoutSession to get attached by the extension
    this.docRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data();
      if (error) {
        // Show an error to your customer and
        // inspect your Cloud Function logs in the Firebase console.
        alert(`An error occured: ${error.message}`);
      }
      if (sessionId) {
        // We have a session, let's redirect to Checkout
        // Init Stripe
        const stripe = await loadStripe(
          'pk_test_51HtaF3KWbAZBgyTQXKMAp5h3nc1kmAWbi5vBcp14AmrqXR8XWYKXwIPhSZoOPiZBKRkl9Id6wi6nHi8p5NApRR0000oRMZr5Zl'
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  }

  // async onStartBusinessPlan() {
  //   this.isLoading = true;
  //   this.docRef = await this.db
  //     .collection('users')
  //     .doc((await this.auth.currentUser).uid)
  //     .collection('checkout_sessions')
  //     .add({
  //       price: 'price_1IYFKKKWbAZBgyTQ0jCIzolD',
  //       success_url: window.location.origin,
  //       cancel_url: window.location.origin,
  //     });
  //   // Wait for the CheckoutSession to get attached by the extension
  //   this.docRef.onSnapshot(async (snap) => {
  //     const { error, sessionId } = snap.data();
  //     if (error) {
  //       // Show an error to your customer and
  //       // inspect your Cloud Function logs in the Firebase console.
  //       alert(`An error occured: ${error.message}`);
  //     }
  //     if (sessionId) {
  //       // We have a session, let's redirect to Checkout
  //       // Init Stripe
  //       const stripe = await loadStripe(
  //         'pk_test_51HtaF3KWbAZBgyTQXKMAp5h3nc1kmAWbi5vBcp14AmrqXR8XWYKXwIPhSZoOPiZBKRkl9Id6wi6nHi8p5NApRR0000oRMZr5Zl'
  //       );
  //       stripe.redirectToCheckout({ sessionId });
  //     }
  //   });
  // }

  // async onStartEnterprisePlan() {
  //   this.isLoading = true;
  //   this.docRef = await this.db
  //     .collection('users')
  //     .doc((await this.auth.currentUser).uid)
  //     .collection('checkout_sessions')
  //     .add({
  //       price: 'price_1IYFMaKWbAZBgyTQ3UYzrmPE',
  //       success_url: window.location.origin,
  //       cancel_url: window.location.origin,
  //     });
  //   // Wait for the CheckoutSession to get attached by the extension
  //   this.docRef.onSnapshot(async (snap) => {
  //     const { error, sessionId } = snap.data();
  //     if (error) {
  //       // Show an error to your customer and
  //       // inspect your Cloud Function logs in the Firebase console.
  //       alert(`An error occured: ${error.message}`);
  //     }
  //     if (sessionId) {
  //       // We have a session, let's redirect to Checkout
  //       // Init Stripe
  //       const stripe = await loadStripe(
  //         'pk_test_51HtaF3KWbAZBgyTQXKMAp5h3nc1kmAWbi5vBcp14AmrqXR8XWYKXwIPhSZoOPiZBKRkl9Id6wi6nHi8p5NApRR0000oRMZr5Zl'
  //       );
  //       stripe.redirectToCheckout({ sessionId });
  //     }
  //   });
  // }
}
