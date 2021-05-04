//NOTE: Data transfer, only works on chrome and firefox. Other browsers wouldn't allow this

//LATER: webpack(obfuscate) code, so that you make it hard as hell for someone to copy you
//LATER: have loading spinner while fetching auth states for better ux

//LATER: have forgot password button

//TODO: add script for resellsavvy

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

const depopBtn = document.querySelector("#post-to-depop");

if (depopBtn) {
  depopBtn.addEventListener("click", postToDepop);
}

function postToDepop() {
  console.log("depop");

  chrome.runtime.sendMessage({ command: "create-depop-item" });
}

//
//TODO: ebay
// const depopBtn = document.querySelector("#post-to-depop");

// if (depopBtn) {
//   depopBtn.addEventListener("click", postToDepop);
// }

// function postToDepop() {
//   console.log("depop");

//   chrome.runtime.sendMessage({ command: "create-depop-item" });
// }

//

const etsyBtn = document.querySelector("#post-to-etsy");

if (etsyBtn) {
  etsyBtn.addEventListener("click", postToEtsy);
}

function postToEtsy() {
  console.log("etsy");

  chrome.runtime.sendMessage({ command: "create-etsy-item" });
}

//

const facebookBtn = document.querySelector("#post-to-facebook");

if (facebookBtn) {
  facebookBtn.addEventListener("click", postToFacebook);
}

function postToFacebook() {
  console.log("facebook");

  chrome.runtime.sendMessage({ command: "create-facebook-item" });
}

//

const grailedBtn = document.querySelector("#post-to-grailed");

if (grailedBtn) {
  grailedBtn.addEventListener("click", postToGrailed);
}

function postToGrailed() {
  console.log("grailed");

  chrome.runtime.sendMessage({ command: "create-grailed-item" });
}

//

const kidizenBtn = document.querySelector("#post-to-kidizen");

if (kidizenBtn) {
  kidizenBtn.addEventListener("click", postToKidizen);
}

function postToKidizen() {
  console.log("kidizen");

  chrome.runtime.sendMessage({ command: "create-kidizen-item" });
}

//

const mercariBtn = document.querySelector("#post-to-mercari");

if (mercariBtn) {
  mercariBtn.addEventListener("click", postToMercari);
}

function postToMercari() {
  console.log("mercari");

  chrome.runtime.sendMessage({ command: "create-mercari-item" });
}

//

//

const poshmarkBtn = document.querySelector("#post-to-poshmark");

if (poshmarkBtn) {
  poshmarkBtn.addEventListener("click", postToPoshmark);
}

function postToPoshmark() {
  console.log("poshmark");

  chrome.runtime.sendMessage({ command: "create-poshmark-item" });
}

// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/poshmark.js"],
//   "matches": ["*://poshmark.com/*"],
//   "run_at": "document_start"
// },

// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/facebook.js"],
//   "matches": ["*://www.facebook.com/*"],
//   "run_at": "document_start"
// },

// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/kidizen.js"],
//   "matches": ["*://www.kidizen.com/*"],
//   "run_at": "document_start"
// },
// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/grailed.js"],
//   "matches": ["*://www.grailed.com/*"],
//   "run_at": "document_start"
// },
// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/etsy.js"],
//   "matches": ["*://www.etsy.com/*"],
//   "run_at": "document_start"
// }

// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/mercari.js"],
//   "matches": ["*://www.mercari.com/*"],
//   "run_at": "document_start"
// },

// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/ebay.js"],
//   "matches": [
//     "*://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList&&DraftURL=*"
//   ],
//   "run_at": "document_start"
// }
