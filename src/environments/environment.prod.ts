export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: 'AIzaSyDtCBELRoPX5_yROLsHyYjJB0ruc-M5Pjo',
    authDomain: 'reseller-savvy.firebaseapp.com',
    projectId: 'reseller-savvy',
    storageBucket: 'reseller-savvy.appspot.com',
    messagingSenderId: '377665812888',
    appId: '1:377665812888:web:de58d14adfbaf5f9c5d3ed',
  },
  azure: {
    itemImages: 'item-images',
    accountName: 'resellsavvyprod',
    storagePath: 'https://resellsavvyprod.blob.core.windows.net/item-images/',
  },
  stripe: {
    publishableKey:
      'pk_live_51HtaF3KWbAZBgyTQq29b3M7tbJlqM2HhGlZU4E76P9Hnb1V9Dw82fPmtMcBobqbV1bMszJudT2wklQsQkHeKprZ500x8spOu3T',
    priceId: 'price_1J3swhKWbAZBgyTQ8qfdJ9Pi',
  },
};
