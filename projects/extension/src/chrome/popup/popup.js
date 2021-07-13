//NOTE: Data transfer, only works on chrome and firefox. Other browsers wouldn't allow this

//LATER: webpack(obfuscate) code, so that you make it hard as hell for someone to copy you
//LATER: have loading spinner while fetching auth states for better ux

//LATER: have forgot password button

let loggedIn = false;
let isSubscriptionValid = false;

//Logged out state ----->

const loggedOutDiv = document.querySelector("#rs-logged-out");
const signinBtn = document.querySelector("#rs-sign-in-btn");
const emailInput = document.querySelector("#rs-email");
const passwordInput = document.querySelector("#rs-password");

if (signinBtn) {
  signinBtn.addEventListener("click", signin);
}

function signin() {
  chrome.runtime.sendMessage(
    {
      command: "signin-auth",
      data: { email: emailInput.value, password: passwordInput.value },
    },
    (response) => {
      if (response.status == "error") {
        alert(response.message.message);

        loggedIn = false;
        validateAuth();
      } else if (response.status == "success") {
        loggedIn = true;
        validateAuth();
      }
    }
  );
}

//Logged in state --------->

const loggedInDiv = document.querySelector("#rs-logged-in");
const subscriptionAlert = document.querySelector("#rs-subscription-alert");
const logoutBtn = document.querySelector("#rs-logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

function logout() {
  chrome.runtime.sendMessage({ command: "logout-auth" }, (response) => {
    if (response.status == "success") {
      loggedIn = false;
      validateAuth();
    }
  });
}

//Functions ------->

function checkAuthentication() {
  chrome.runtime.sendMessage({ command: "check-auth" }, (response) => {
    console.log("check auth");
    if (response.status == "success") {
      loggedIn = true;
      validateAuth();
    } else {
      loggedIn = false;
      validateAuth();
    }
  });
}

function validateAuth() {
  if (loggedIn == true) {
    loggedInDiv.style.display = "block";
    loggedOutDiv.style.display = "none";

    checkSubscription();
  } else {
    loggedInDiv.style.display = "none";
    loggedOutDiv.style.display = "block";
  }
}

function checkSubscription() {
  chrome.runtime.sendMessage({ command: "check-subscription" }, (response) => {
    if (response.status == "active") {
      isSubscriptionValid = true;
      validateSubscription();
    } else {
      isSubscriptionValid = false;
      validateSubscription();
    }
  });
}

function validateSubscription() {
  if (isSubscriptionValid == true) {
    subscriptionAlert.style.display = "none";
  } else {
    subscriptionAlert.style.display = "block";
  }
}

checkAuthentication();

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === "mac") {
      const fontFaceSheet = new CSSStyleSheet();
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ];
    }
  });
}

//TODO: this is just for testing, delete only when you finish testing all copy/pasting

////////////////////////////////////////////////

const depop = document.querySelector("#get-from-depop");

if (depop) {
  depop.addEventListener("click", copyFromDepop);
}

function copyFromDepop() {
  chrome.runtime.sendMessage({ command: "get-listing-from-depop" });
}

const ebay = document.querySelector("#get-from-ebay");

if (ebay) {
  ebay.addEventListener("click", copyFromEbay);
}

function copyFromEbay() {
  chrome.runtime.sendMessage({ command: "get-listing-from-ebay" });
}

const etsy = document.querySelector("#get-from-etsy");

if (etsy) {
  etsy.addEventListener("click", copyFromEtsy);
}

function copyFromEtsy() {
  chrome.runtime.sendMessage({ command: "get-listing-from-etsy" });
}

const grailed = document.querySelector("#get-from-grailed");

if (grailed) {
  grailed.addEventListener("click", copyFromGrailed);
}

function copyFromGrailed() {
  chrome.runtime.sendMessage({ command: "get-listing-from-grailed" });
}

const kidizen = document.querySelector("#get-from-kidizen");

if (kidizen) {
  kidizen.addEventListener("click", copyFromKidizen);
}

function copyFromKidizen() {
  chrome.runtime.sendMessage({ command: "get-listing-from-kidizen" });
}

const mercari = document.querySelector("#get-from-mercari");

if (mercari) {
  mercari.addEventListener("click", copyFromMercari);
}

function copyFromMercari() {
  chrome.runtime.sendMessage({ command: "get-listing-from-mercari" });
}

const poshmark = document.querySelector("#get-from-poshmark");

if (poshmark) {
  poshmark.addEventListener("click", copyFromPoshmark);
}

function copyFromPoshmark() {
  chrome.runtime.sendMessage({ command: "get-listing-from-poshmark" });
}

const ebayOpen = document.querySelector("#post-ebay");

if (ebayOpen) {
  ebayOpen.addEventListener("click", openEbay);
}

function openEbay() {
  chrome.runtime.sendMessage(
    {
      command: "api-create-item",
      data: "tester",
      // data: {
      //   properties: {
      //     imageUrls: imageUrls,
      //     title: title,
      //     desc: desc,
      //     sku: sku,
      //     color: color,
      //     brand: brand,
      //     condition: condition,
      //     price: price,
      //   },
      //   listing: {
      //     from_marketplace: from_marketplace,
      //     listingUrl: listingUrl,
      //     listingId: listingId,
      //   },
      // },
    },
    (response) => {
      console.log("yoooooooooo; ", response);
    }
  );

  // chrome.runtime.sendMessage({
  //   command: "test-ebay",
  // });
}

//LATER: if user wants to crosslist but they are in different countries other than the us, add an options tab on the popup, and they can specify where they want to crosslist to(poshmark us, or poshmark canada for example). This will only be a change on the localhost, but if users crosslist to poshmark us for example, and then later change the settings, on firebase it will still showed up as already crosslisted, because it will take the 'poshmark' marketplace in general. The countries specificity only is for local user and crosslist destination. (later make sure that regex for marketplace links in dashboard aren't country specific, they just need to include the poshmark name.)
