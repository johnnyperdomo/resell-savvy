// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyAbbTWPL-KsWsYT18EDJMNq4fhYwQL-kFY',
    authDomain: 'reseller-savvy-dev.firebaseapp.com',
    projectId: 'reseller-savvy-dev',
    storageBucket: 'reseller-savvy-dev.appspot.com',
    messagingSenderId: '51437845156',
    appId: '1:51437845156:web:561cc5e2d812ad808f8431',
  },
  azure: {
    itemImages: 'item-images',
    accountName: 'resellsavvydev',
    storagePath: 'https://resellsavvydev.blob.core.windows.net/item-images/',
  },
  stripe: {
    publishableKey:
      'pk_test_51HtaF3KWbAZBgyTQXKMAp5h3nc1kmAWbi5vBcp14AmrqXR8XWYKXwIPhSZoOPiZBKRkl9Id6wi6nHi8p5NApRR0000oRMZr5Zl',
    priceId: 'price_1IYFIdKWbAZBgyTQ0EqAaGuB',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
