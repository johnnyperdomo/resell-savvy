//LATER: separate into its own functions

// Your web app's Firebase configuration

// NOTE: Firestore not working in chrome extension V3: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/t4i7PRxBtrM/m/ARZip9XIAQAJ

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
      validateSubscription(user)
        .then((subscription) => {
          console.log("user sub active");
          response({
            type: "subscription",
            status: subscription.status,
            message: subscription.status,
          });
        })
        .catch((error) => {
          console.log("error validate sub", error);

          response({
            type: "subscription",
            status: "in-active",
            message: `There was a problem validating your subcription, please try again. Error: ${error}`,
          });
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
        console.log("fetch error is: ", error);
        console.log("fetch error is 2 : ", error.Error);

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
//call api
async function validateSubscription(user) {
  try {
    //1. get token
    const tokenId = await user.getIdToken();

    const server = firebaseServerUrl + "item/validate-subscription";
    const options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
    };

    //LATER: handle errors; try catch

    const response = await fetch(server, options);
    const subscription = await response.json();

    //throw error message
    if (subscription.status != "active") {
      throw Error(
        "You do not have an active subscription. ResellSavvy only works with an active subscription."
      );
    }

    return subscription;
  } catch (error) {
    throw error;
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
  try {
    const user = firebase.auth().currentUser;

    //1. validate auth, if unauthenticated -> throw error
    if (!user) {
      throw "You are not currently logged in. You must be logged in to use ResellSavvy.";
    }

    //1. get token
    const tokenId = await user.getIdToken();

    const server = firebaseServerUrl + "item/fetch-items";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify({
        query_limit: 30,
      }),
    };

    //LATER: handle errors; try catch

    const response = await fetch(server, options);
    const jsonResponse = await response.json();

    const items = jsonResponse.items;

    console.log("items to fetch: ", items);

    return items;
  } catch (error) {
    throw error;
  }
}

//firestore connect listing to item
async function connectListingToItem(itemId, extractedID, marketplace, url) {
  try {
    const user = firebase.auth().currentUser;

    //1. validate auth, if unauthenticated -> throw error
    if (!user) {
      throw "You are not currently logged in. You must be logged in to use ResellSavvy.";
    }

    //1. get token
    const tokenId = await user.getIdToken();

    const server = firebaseServerUrl + "item/connect-listing";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify({
        item_id: itemId,
        extracted_id: extractedID,
        marketplace: marketplace,
        url: url,
      }),
    };

    //LATER: handle errors; try catch

    const response = await fetch(server, options);
    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (error) {
    throw error;
  }
}

//firestore disconnect listing from item
async function disconnectListingFromItem(itemId, marketplace) {
  try {
    const user = firebase.auth().currentUser;

    //1. validate auth, if unauthenticated -> throw error
    if (!user) {
      throw "You are not currently logged in. You must be logged in to use ResellSavvy.";
    }

    //1. get token
    const tokenId = await user.getIdToken();

    const server = firebaseServerUrl + "item/disconnect-listing";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify({
        item_id: itemId,
        marketplace: marketplace,
      }),
    };

    //LATER: handle errors; try catch

    const response = await fetch(server, options);
    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (error) {
    throw error;
  }
}
