//NOTE: Data transfer, only works on chrome and firefox. Other browsers wouldn't allow this

//Manifest.json ---- comments
//    //TODO: add script for resellsavvy
//TODO: move around scripts so it doesn't look copied

// document.getElementById("openMercari").addEventListener("click", function () {
//   chrome.runtime.sendMessage({ name: "message" }, (response) => {
//     alert(response.text);
//   });
// });

document.getElementById("createTab").addEventListener("click", function () {
  chrome.tabs.create(
    { url: "https://www.mercari.com/sell/" },
    function (tab) {}
  );
});

document.getElementById("openMercari").addEventListener("click", function () {
  chrome.tabs.create({ url: "https://www.mercari.com/sell/" }, (tab) => {
    run(tab.id);
  });
  //   chrome.tabs.executeScript(
  //     {
  //       file: `jquery-3.6.0.min.js`,
  //     },
  //     function () {
  //       chrome.tabs.executeScript({
  //         file: "background/injector.js",
  //       });
  //     }

  // )
});

function run(tabId) {
  alert(tabId);

  chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    alert("new tab id is: " + tabId);

    // if (info.status && info.status == "complete") {
    //   alert("complete");
    //   document.body.innerHTML = "";
    // }
  });
}

// "content_scripts": [
//     {
//       "js": ["poshmarkScript.js"],
//       "matches": ["*://poshmark.com/*"]
//     },
//     {
//       "js": ["mercariScript.js"],
//       "matches": ["*://www.mercari.com/*"]
//     },
//     {
//       "js": ["ebayScript.js"],
//       "matches": ["*://www.ebay.com/*"]
//     },
//     {
//       "all_frames": true,
//       "run_at": "document_start",
//       "js": ["ebayBulkSellScript.js"],
//       "matches": [
//         "*://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList&&DraftURL=*"
//       ]
//     },
//     {
//       "all_frames": true,
//       "run_at": "document_start",
//       "js": ["bulkEditScript.js"],
//       "matches": ["*://bulkedit.ebay.com/*"]
//     },
//     {
//       "all_frames": true,
//       "run_at": "document_start",
//       "js": ["ebayPicupload.js"],
//       "matches": ["*://www.picupload.ebay.com/*"]
//     },
//     {
//       "js": ["grailedScript.js"],
//       "matches": ["*://www.grailed.com/*"]
//     },
//     {
//       "js": ["facebookScript.js"],
//       "matches": ["*://www.facebook.com/*"]
//     },
//     {
//       "js": ["depopScript.js"],
//       "matches": ["*://www.depop.com/*"]
//     },
//     {
//       "js": ["etsyScript.js"],
//       "matches": ["*://www.etsy.com/*"]
//     },
//     {
//       "js": ["tradesyScript.js"],
//       "matches": ["*://www.tradesy.com/*"]
//     }
//   ],
//   "web_accessible_resources": [
//     "poshmarkCloset.js",
//     "mercariCloset.js",
//     "ebayCloset.js",
//     "grailedCloset.js",
//     "facebookCloset.js",
//     "depopCloset.js",
//     "etsyCloset.js",
//     "ebayBulkSellCloset.js",
//     "tradesyCloset.js"
//   ],
