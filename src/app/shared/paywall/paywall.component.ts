import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { CouponDialogComponent } from '../coupon-dialog/coupon-dialog.component';
import { Coupon } from '../models/coupon.model';
import * as firebase from 'firebase';
import { User } from '../models/user.model';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styles: ['./paywall.component.scss'],
})
export class PaywallComponent implements OnInit {
  //LATER: when we have our own custom payment solution instead of stripe checkout (like fomo.com), it will be easier to handle custom coupons like extending trial lengths and all that. For now it's very restrictive. For example, if they enter coupoon code, we can redeem it, update the trial length from 14 days to 30 days, and then charge them. Instead of having 7 day free trial + 30 days off.

  //LATER: for now, only get coupons from fb database, but later get coupons from stripe as well. So check if coupon exists in fb, if not exist, check in strip, if not exist, then show errors, unless one of them has an error.
  stripe = loadStripe(environment.stripe.publishableKey);

  user: firebase.default.User;

  subscriptionStatus: 'new' | 'canceled' | 'active';
  couponCode: Coupon;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private dialog: MatDialog
  ) {}

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
              this.subscriptionStatus = 'new';
              console.log(this.subscriptionStatus);
            } else {
              const trialingSubs = await subs.ref
                .where('status', '==', 'trialing')
                .get();
              const activeSubs = await subs.ref
                .where('status', '==', 'active')
                .get();

              if (trialingSubs.docs.length > 0 || activeSubs.docs.length > 0) {
                this.subscriptionStatus = 'active';
                console.log(this.subscriptionStatus);
              } else {
                //needs to resubscribe
                this.subscriptionStatus = 'canceled';
                console.log(this.subscriptionStatus);
              }
            }
          });
      }
    });
  }

  async onStripeCheckout() {
    //LATER: pass in subscription_data[coupon] in checkout session,
    //https:stripe.com/docs/billing/subscriptions/discounts#using-coupons-in-checkout
    try {
      const checkoutSessionCallable = firebase.default
        .functions()
        .httpsCallable('createCheckoutSession');

      if (this.subscriptionStatus === 'canceled') {
        //canceled user: no trial length

        let checkoutSession = await checkoutSessionCallable({
          trialLength: null, //can't be 0
          priceid: environment.stripe.priceId,
          successUrl: `${window.location.origin}/getting-started`,
          cancelUrl: `${window.location.origin}/paywall`,
          coupon: null,
        });

        const sessionId = checkoutSession.data.id;
        //TODO: loading spinner

        (await this.stripe).redirectToCheckout({ sessionId: sessionId });
      } else if (this.subscriptionStatus === 'new') {
        if (!this.couponCode) {
          //new user no coupon: default 14 day trial

          let checkoutSession = await checkoutSessionCallable({
            trialLength: 14,
            priceid: environment.stripe.priceId,
            successUrl: `${window.location.origin}/getting-started`,
            cancelUrl: `${window.location.origin}/paywall`,
            coupon: null,
          });

          const sessionId = checkoutSession.data.id;
          console.log(sessionId);

          (await this.stripe).redirectToCheckout({ sessionId: sessionId });
        } else {
          //LATER: do more configurations to figure out how to apply this code based on what system created it etc, and if it's from stripe or firebase
          if (this.couponCode.createdBy == 'firebase') {
            if (
              this.couponCode.type &&
              this.couponCode.type == 'trialLength' &&
              this.couponCode.trialLength
            ) {
              //coupon: custom trial length

              let checkoutSession = await checkoutSessionCallable({
                trialLength: this.couponCode.trialLength,
                priceid: environment.stripe.priceId,
                successUrl: `${window.location.origin}/getting-started`,
                cancelUrl: `${window.location.origin}/paywall`,
                coupon: { source: 'firebase', id: this.couponCode.id },
              });

              const sessionId = checkoutSession.data.id;

              (await this.stripe).redirectToCheckout({ sessionId: sessionId });
            }
          } else {
            //LATER: handle what to do if coupon is handled by stripe
          }
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  onEnterCoupon() {
    const dialogRef = this.dialog.open(CouponDialogComponent, {
      data: { couponCode: '' },
    });

    dialogRef.afterClosed().subscribe((couponCode) => {
      if (!couponCode) {
        return;
      }

      this.verifyCoupon(couponCode);
    });
  }

  async verifyCoupon(couponCode: string) {
    //TODO

    try {
      const codeSnapshot = await this.db
        .collection<Coupon>('codes')
        .doc(couponCode)
        .get()
        .toPromise();

      if (!codeSnapshot.exists) {
        throw Error('Invalid Code');
      }

      const code = codeSnapshot.data();

      if (code.newCustomersOnly === true && this.subscriptionStatus != 'new') {
        throw Error('Expired Code');
      }
      //success

      this.couponCode = code;

      // //increment code redemptions so we have an idea how many users used code, not completely accurate but it's close.
      // const increment = firebase.default.firestore.FieldValue.increment(1);

      // const codeRef = this.db.collection('codes').doc(couponCode);

      // await codeRef.update({ redemptions: increment });

      // const redemptionRef = codeRef
      //   .collection('redemptions')
      //   .doc(this.user.uid);

      // await redemptionRef.set(
      //   {
      //     userID: this.user.uid,
      //     date: firebase.default.firestore.Timestamp.now(),
      //   },
      //   { merge: true }
      // );
    } catch (error) {
      alert(error);
    }
  }
}
