var swalAlert = new SwalAlert();

function createLinkButton() {
  var findHost = document.querySelectorAll(".rs-link-host-element");

  if (findHost.length > 0) {
    //exit out function here, if button is already created/found
    return;
  }

  // create host element
  const hostElement = document.createElement("div");
  hostElement.className = "rs-link-host-element";
  document.body.appendChild(hostElement);

  var host = document.querySelector(".rs-link-host-element");
  var root = host.attachShadow({ mode: "open" });

  const button = document.createElement("button");
  button.classList = "rs-link-btn bootstrap-btn";

  //shadow dom doesn't inherit parent styles or bootstrap css
  //LATER: make button cuter/ui friendly + shadow
  button.innerHTML =
    "<style>.rs-link-btn{border-radius: 28px; border-collapse: separate; height: 56px;width: 56px;position: fixed;bottom: 20px;left: 20px;box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 8px;z-index: 100;} .bootstrap-btn {display: inline-block;font-weight: 400;color: #212529;text-align: center;border: 1px solid transparent; color: #fff;background-color: #007bff;}.bootstrap-btn:hover{background-color: #0069d9;cursor: pointer;}</style>" +
    '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>';
  button.addEventListener("click", onLinkBtnPressed);

  root.appendChild(button);
}

async function onLinkBtnPressed() {
  //LATER: currently using this method to verify if content script is in listing url page, bcuz in spa applications, page isn't reloaded, so content script isn't removed. Which can leak the listing button to another page.
  //LATER: //FIX: fix leaking blue corner buttons on other pages, recheck observer

  let windowURL = window.location.href;

  if (windowURL.indexOf("depop.com/products") > -1) {
    console.log(" closet detected, ", window.location.href);
  }

  let marketplace = "depop";
 

  let query =
    "?" + `marketplace=${marketplace}&url=${windowURL}`;

  let src = chrome.extension.getURL("index.html?#/listing-connect") + query;

  // //TODO: this code is just to test
  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   var myTabId = tabs[0].id;
  //   chrome.tabs.sendMessage(myTabId, { text: "hi" }, function (response) {
  //     alert(response);
  //   });
  // });

  swalAlert.showModalIframes(src);
}

function fetchLoggedInUser() {
  //return true or false
}

function showErrorMessage() {
  //swal error message
}

function openLinkingModal() {
  //show linking modal here, modal present
  //fetch items
}

function linkItemWithListing(id) {
  //link this item with the listing in the rs savvy inventory
  //set item in firebase
}

function unlinkItemFromListing(id) {
  //unlink item from rs savvy inventory
  //set new item firebase
}

createLinkButton();

// chrome.runtime.onMessage.addListener((msg, sender, response) => {
//   //check user authentication
//   if (msg.command == "depop-tester") {
//     console.log(
//       "content script called in depop!!!!!!!!!!! from iframe listing connect"
//     );
//     response(
//       "this is a messge from the depop tester into the iframe listing connect"
//     );
//   }
// });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
});

// function getCurrentTabId() {
//   var tabId = "";
//   let [tab] = await chrome.tabs.getCurrent();

//   await chrome.tabs.getCurrent((tab) => {
//     tabId = tab.id;
//   });

//   return tabId;
// }

// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }
