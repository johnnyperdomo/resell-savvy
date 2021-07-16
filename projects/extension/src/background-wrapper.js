try {
  // importScripts("chrome/background/background.js");
  importScripts(
    "chrome/third-party/firebase/firebase-app.js",
    "chrome/third-party/firebase/firebase-auth.js",
    "chrome/third-party/firebase/firebase-firestore.js",
    "chrome/background/firebase.js",
    "chrome/background/background.js",
    "chrome/background/sessions.js",
    "chrome/background/closet.js",
    "chrome/background/listing.js"
  ); //TODO: import firebase scripts
} catch (error) {
  console.log(error);
}
