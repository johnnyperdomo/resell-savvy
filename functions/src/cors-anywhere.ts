//used as a proxy to fetch images from the the client side browser(when crosslisting images, client side can't proxy headers), due to cors error: https://github.com/Rob--W/cors-anywhere: adds CORS headers to the proxied request

import * as functions from 'firebase-functions';

const cors_proxy = require('cors-anywhere').createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers.
  removeHeaders: [], // Do not remove any headers.
});

export const corsanywhere = functions.https.onRequest(async (req, res) => {
  cors_proxy.emit('request', req, res);
});
