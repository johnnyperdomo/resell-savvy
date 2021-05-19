//listen to when user lands on a closet
//FIX: in wait for load elements functions, we should set a timeout time, because it could run forever, and it won't let us reload page if it starts to 'wait for node, but then it doesn't find'
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //   console.log("updated, ", tabId, changeInfo, tab);

  //depop closet
  //TODO: //FIX: gives some error cuz of node loading
  if (tab.url.indexOf("depop.com/") > -1) {
    console.log("depop page is reloaded");
    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/depop-closet.js",
    });
  }

  //ebay closet
  //TODO: bulk sell page works so don't worry about it
  if (tab.url.indexOf("ebay.com/sh/lst/active") > -1) {
    console.log("ebay closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/ebay-closet.js",
    });
  }

  //etsy closet
  //TODO: wait for element to load, heading, before detecting closet
  if (tab.url.indexOf("etsy.com/your/shops") > -1) {
    console.log("etsy closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/etsy-closet.js",
    });
  }

  //facebook closet
  //LATER: this is a little complex
  // if (tab.url.indexOf("facebook.com/marketplace/you/selling") > -1) {
  //   console.log("facebook closet detected, tab = ", tabId);

  //   chrome.tabs.executeScript(tab.id, {
  //     file: "marketplaces/closets/facebook-closet.js",
  //   });
  // }

  //grailed closet
  if (tab.url.indexOf("grailed.com/users/myitems") > -1) {
    console.log("grailed closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/grailed-closet.js",
    });
  }

  //kidizen closet
  //LATER: make sure the closet is the personal closet, look for edit button
  if (tab.url.indexOf("kidizen.com/users") > -1) {
    console.log("kidizen closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/kidizen-closet.js",
    });
  }

  //mercari closet
  if (tab.url.indexOf("mercari.com/mypage/listings") > -1) {
    console.log("mercari closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/mercari-closet.js",
    });
  }

  //poshmark closet
  if (tab.url.indexOf("poshmark.com/closet") > -1) {
    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/closets/poshmark-closet.js",
    });
  }

  //TODO: listen for url changes, watch for when user lands on success page (specific for tab), or when

  //TODO: if success page, get the listing url, and then call cloud function api to post to firebase (verify the successs data in the cloud function, if new, upload data to item. else, if already created, jsut save new url.) - api to make it super fast
});

// "*://*.facebook.com/*",
// {
//   "css": ["marketplaces/closets/facebook-closet.css"],
//   "matches": ["*://*.facebook.com/*"]
// },

//LATER: see how you can make your web scraping more robust, since data can change on any given page
// https://codeburst.io/two-simple-technique-for-web-scraping-pages-with-dynamically-created-css-class-names-72eaca8c1304
