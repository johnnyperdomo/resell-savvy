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

//TODO: validate fb auth and based on response toggle ui states

function checkAuthentication() {
  chrome.runtime.sendMessage({ command: "check-auth" }, (response) => {
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

    validateSubscription();
  } else {
    loggedInDiv.style.display = "none";
    loggedOutDiv.style.display = "block";
  }
}

function validateSubscription() {
  //TODO: get state from firestore
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
