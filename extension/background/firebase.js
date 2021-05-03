// Your web app's Firebase configuration
//TODO: this should be a different key for production
var firebaseConfig = {
  apiKey: "AIzaSyAbbTWPL-KsWsYT18EDJMNq4fhYwQL-kFY",
  authDomain: "reseller-savvy-dev.firebaseapp.com",
  projectId: "reseller-savvy-dev",
  storageBucket: "reseller-savvy-dev.appspot.com",
  messagingSenderId: "51437845156",
  appId: "1:51437845156:web:561cc5e2d812ad808f8431",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //check user authentication
  if (msg.command == "check-auth") {
    let user = firebase.auth().currentUser;

    if (user) {
      response({ type: "auth", status: "success", message: user });
    } else {
      response({ type: "auth", status: "false", message: false });
    }
  }

  //signin user
  if (msg.command == "signin-auth") {
    let data = msg.data;
    let email = data.email;
    let password = data.password;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        response({ type: "auth", status: "error", message: error });
      });

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        response({ type: "auth", status: "success", message: user });
      }
    });
  }

  //logout user
  if (msg.command == "logout-auth") {
    firebase
      .auth()
      .signOut()
      .then(
        function () {
          response({ type: "auth", status: "success", message: true });
        },
        function (error) {
          response({ type: "auth", status: "error", message: error });
        }
      );
  }

  if (msg.command == "check-subscription") {
    //LATER: handle errors
    let user = firebase.auth().currentUser;

    if (user) {
      let subs = firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("subscriptions");

      subs.get().then((snap) => {
        if (snap.docs.length === 0) {
          //completely new user - subscription inactive
          response({
            type: "subscription",
            status: "in-active",
            message: false,
          });
        } else {
          //users who had or have a current subscription
          let totalSubscriptions = snap.docs.map((doc) => {
            return doc.data();
          });

          let trialingSubs = totalSubscriptions.filter(
            (doc) => doc.status == "trialing"
          );

          let activeSubs = totalSubscriptions.filter(
            (doc) => doc.status == "active"
          );

          if (trialingSubs.length > 0 || activeSubs.length > 0) {
            //active sub
            response({
              type: "subscription",
              status: "active",
              message: true,
            });
          } else {
            //inactive sub
            response({
              type: "subscription",
              status: "in-active",
              message: false,
            });
          }
        }
      });
    }
  }

  return true;
});
