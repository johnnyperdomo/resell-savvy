//LATER: separate into its own functions

//TODO: //FIX

// Your web app's Firebase configuration
var firebaseConfig = {};
var firebaseServerUrl = "";

var azureStoragePath = ""; //blob storage

//get extension state
chrome.management.get(chrome.runtime.id, (extensionInfo) => {
  if (extensionInfo.installType === "development") {
    //development keys

    firebaseConfig = {
      apiKey: "AIzaSyAbbTWPL-KsWsYT18EDJMNq4fhYwQL-kFY",
      authDomain: "resell-savvy-dev.firebaseapp.com",
      projectId: "reseller-savvy-dev",
      storageBucket: "reseller-savvy-dev.appspot.com",
      messagingSenderId: "51437845156",
      appId: "1:51437845156:web:561cc5e2d812ad808f8431",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    console.log("development mode: = ", firebaseConfig);

    firebaseServerUrl =
      "https://us-central1-reseller-savvy-dev.cloudfunctions.net/";

    azureStoragePath =
      "https://resellsavvydev.blob.core.windows.net/item-images/";
  } else if (extensionInfo.installType === "production") {
    //production keys

    firebaseConfig = {
      apiKey: "AIzaSyB0NJRwgphk79xSOJ9j6vh2-PP0xSPJxg4",
      authDomain: "resell-savvy.firebaseapp.com",
      projectId: "resell-savvy",
      storageBucket: "resell-savvy.appspot.com",
      messagingSenderId: "624998877316",
      appId: "1:624998877316:web:9b8222b4eca78adbb45ad1",
      measurementId: "G-7E7J9FLK9Y",
    };
    console.log("production mode: = ", firebaseConfig);

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    firebaseServerUrl = "https://us-central1-resell-savvy.cloudfunctions.net/";

    azureStoragePath =
      "https://resellsavvyprod.blob.core.windows.net/item-images/";
  }
});

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

  //check subscription
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

  //check auth-and-subscription
  if (msg.command == "check-auth-and-subscription") {
    checkAuthSubscription()
      .then((res) => {
        response({
          status: "success",
          message: "authorized",
        });
      })
      .catch((error) => {
        response({ status: "error", message: error });
      });
  }

  //fetch inventory items
  if (msg.command == "fetch-inventory-items") {
    //LATER: try to make this code nicer, maybe use await. I tried, but it failed when i was trying to implement
    fetchInventoryItems()
      .then((res) => {
        response({
          status: "success",
          message: { items: res, azureStoragePath: azureStoragePath },
        });
      })
      .catch((error) => {
        response({ status: "error", message: error });
      });
  }

  //connect listing to itme
  if (msg.command == "firestore-connect-listing") {
    let itemId = msg.data.itemId;
    let extractedID = msg.data.extractedID;
    let marketplace = msg.data.marketplace;
    let url = msg.data.url;
    connectListingToItem(itemId, extractedID, marketplace, url);
    //LATER: wait for actual response, if error is throw, show it to ui
  }

  //disconnect listing from item
  if (msg.command == "firestore-disconnect-listing") {
    let itemId = msg.data.itemId;
    let marketplace = msg.data.marketplace;

    disconnectListingFromItem(itemId, marketplace);
    //LATER: wait for actual response, if error is throw, show it to ui
  }

  return true;
});

//functions ======>

//validate sub
async function validateSubscription(user) {
  try {
    let subs = firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .collection("subscriptions");

    let snap = await subs.get();

    if (snap.docs.length === 0) {
      //completely new user - subscription inactive
      return {
        type: "subscription",
        status: "in-active",
        message:
          "You do not have an active subscription. ResellSavvy only works with an active subscription.",
      };
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
        return {
          type: "subscription",
          status: "active",
          message: false,
        };
      } else {
        //inactive sub
        throw Error(
          "You do not have an active subscription. ResellSavvy only works with an active subscription."
        );
      }
    }
  } catch (error) {
    throw Error(error);
  }
}

//create item in server
//LATER: handle errors
async function apiCreateItem(properties, listing) {
  const user = firebase.auth().currentUser;

  if (user) {
    //1. get token
    user.getIdToken().then((tokenId) => {
      console.log("token is: ", tokenId);

      const server = firebaseServerUrl + "item/create";
      const options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
        body: JSON.stringify({
          listing: listing,
          properties: properties,
        }),
      };

      //LATER: handle errors; try catch
      fetch(server, options).then((res) => {
        if (res.ok) {
          console.log("successfully created item in server: ", res);
        } else {
          console.log("error creating item: ", res);
        }
      });
    });
  }

  console.log("server creation message received: ", properties, listing);
}

async function checkAuthSubscription() {
  return new Promise(async (resolve, reject) => {
    try {
      const user = firebase.auth().currentUser;

      //1. validate auth, if unauthenticated -> throw error
      if (!user) {
        throw Error(
          "You are not currently logged in. You must be logged in to use ResellSavvy."
        );
      }

      //2. validate sub, if not subbed -> throw error
      await validateSubscription(user);

      resolve(true);
    } catch (error) {
      reject(error.message);
    }
  });
}

//fetch inventory items
async function fetchInventoryItems() {
  return new Promise(async (resolve, reject) => {
    try {
      const user = firebase.auth().currentUser;

      //1. validate auth, if unauthenticated -> throw error
      if (!user) {
        throw Error(
          "You are not currently logged in. You must be logged in to connect your listings. Make sure you are logged in by clicking on the extension popup."
        );
      }

      //2. validate sub, if not subbed -> throw error
      await validateSubscription(user);

      let itemRef = await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("items")
        .orderBy("modified", "desc")
        .limit(30)
        .get();

      let items = itemRef.docs.map((doc) => {
        return doc.data();
      });

      resolve(items);
      //3. fetch items
    } catch (error) {
      reject(error.message);
    }
  });
}

//firestore connect listing to item
async function connectListingToItem(itemId, extractedID, marketplace, url) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        throw Error(
          "You are not currently logged in. You must be logged in to connect your listings. Make sure you are logged in by clicking on the extension popup."
        );
      }

      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("items")
        .doc(itemId)
        .set(
          {
            marketplaces: {
              [`${marketplace}`]: { extractedID: extractedID, url: url },
            },
          },
          { merge: true }
        );

      resolve(true);
    } catch (error) {
      reject(error.message);
    }
  });
}

//firestore disconnect listing from item
async function disconnectListingFromItem(itemId, marketplace) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        throw Error(
          "You are not currently logged in. You must be logged in to connect your listings. Make sure you are logged in by clicking on the extension popup."
        );
      }

      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("items")
        .doc(itemId)
        .set(
          {
            marketplaces: { [`${marketplace}`]: null },
          },
          { merge: true }
        );

      resolve(true);
    } catch (error) {
      reject(error.message);
    }
  });
}
