import * as functions from 'firebase-functions';
import { stripe } from './config';
import { HttpsError } from 'firebase-functions/lib/providers/https';

import * as admin from 'firebase-admin';
const db = admin.firestore();

//to handle subscription billing for users with stripe
export const createBillingPortalSession = functions.https.onCall(
  async (data, context) => {
    try {
      if (!context.auth || !context.auth.uid) {
        throw new HttpsError(
          'unauthenticated',
          'You are not authorized to make this request.'
        );
      }

      const userRef = db.doc(`users/${context.auth.uid}`);
      const userSnap = await userRef.get();
      const userData = userSnap.data()!;

      const stripeCustomerID = userData.stripeId;

      if (!stripeCustomerID) {
        throw new functions.https.HttpsError(
          'not-found',
          'Stripe Customer ID not found'
        );
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerID,
      });

      return portalSession;
    } catch (error) {
      throw Error(error);
    }
  }
);