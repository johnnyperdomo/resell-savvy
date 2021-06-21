import * as admin from 'firebase-admin';
admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true });
//   response.send('Hello from Firebase!');
// });

export { uploadSignature } from './azure/sas';
export { deleteAllItemImages } from './item.triggers';
export { deleteIndividualItemImages } from './item.triggers';
export { createBillingPortalSession, createCheckoutSession } from './stripe';
export { corsanywhere } from './cors-anywhere';
export { item } from './item.api';
