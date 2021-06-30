//listen to when user lands on a closet

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //   console.log("updated, ", tabId, changeInfo, tab);

  //depop closet
  if (tab.url.indexOf("depop.com/") > -1) {
    console.log("depop page is reloaded");
    chrome.tabs.executeScript(tab.id, {
      file: "chrome/marketplaces/closets/depop-closet.js",
    });
  }

  //ebay closet
  if (tab.url.indexOf("ebay.com/sh/lst/active") > -1) {
    console.log("ebay closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "chrome/marketplaces/closets/ebay-closet.js",
    });
  }

  //etsy closet
  if (tab.url.indexOf("etsy.com/your/shops") > -1) {
    console.log("etsy closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "chrome/marketplaces/closets/etsy-closet.js",
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
      file: "chrome/marketplaces/closets/grailed-closet.js",
    });
  }

  //kidizen closet
  //LATER: make sure the closet is the personal closet, look for edit button
  if (tab.url.indexOf("kidizen.com/users") > -1) {
    console.log("kidizen closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "chrome/marketplaces/closets/kidizen-closet.js",
    });
  }

  //mercari closet
  if (tab.url.indexOf("mercari.com/mypage/listings") > -1) {
    console.log("mercari closet detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "chrome/marketplaces/closets/mercari-closet.js",
    });
  }

  //poshmark closet
  if (tab.url.indexOf("poshmark.com/closet") > -1) {
    chrome.tabs.executeScript(tab.id, {
      file: "chrome/marketplaces/closets/poshmark-closet.js",
    });
  }

  //TODO: listen for url changes, watch for when user lands on success page (specific for tab), or when
});

//LATER: see how you can make your web scraping more robust, since data can change on any given page
// https://codeburst.io/two-simple-technique-for-web-scraping-pages-with-dynamically-created-css-class-names-72eaca8c1304
//LATER: your websraping tools should also be done in a way of importance and availability, 'id'(99% of the time unique, and rarely changes), if not available -> 'name'(not necessarily unique, but it can be, and it changes less), 'class'(sometimes not unique, and it can change more often than the other two). i.e., if we're looking for an input, better to look for type input with an id attached rather than a class name: see this tut for more explanation: https://www.youtube.com/watch?v=b5jt2bhSeXs
