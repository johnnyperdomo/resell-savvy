//LATER: check if this is user's closet, not just any random user's

//TODO: show link url
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //depop listing
  if (tab.url.indexOf("depop.com/products") > -1) {
    console.log("depop item detected");

    // chrome.tabs.executeScript(tab.id, {
    //   file: "marketplaces/closets/depop-closet.js",
    // });
  }

  //ebay listing
  //TODO: bulk sell page works so don't worry about it
  if (tab.url.indexOf("ebay.com/itm") > -1) {
    console.log("ebay listing detected, tab = ", tabId);

    //   chrome.tabs.executeScript(tab.id, {
    //     file: "marketplaces/closets/ebay-closet.js",
    //   });
  }

  //etsy listing
  //TODO: wait for element to load, heading, before detecting closet
  if (tab.url.indexOf("etsy.com/listing") > -1) {
    console.log("etsy listing detected, tab = ", tabId);

    //   chrome.tabs.executeScript(tab.id, {
    //     file: "marketplaces/closets/etsy-closet.js",
    //   });
  }

  //facebook listing
  //LATER: this is a little complex
  // if (tab.url.indexOf("facebook.com/marketplace/you/selling") > -1) {
  //   console.log("facebook closet detected, tab = ", tabId);

  //   chrome.tabs.executeScript(tab.id, {
  //     file: "marketplaces/closets/facebook-closet.js",
  //   });
  // }

  //grailed listing
  if (tab.url.indexOf("grailed.com/listings") > -1) {
    console.log("grailed listing detected, tab = ", tabId);

    //   chrome.tabs.executeScript(tab.id, {
    //     file: "marketplaces/closets/grailed-closet.js",
    //   });
  }

  //kidizen listing
  //TODO: make sure the closet is the personal closet, look for edit button
  if (tab.url.indexOf("kidizen.com/items") > -1) {
    console.log("kidizen listing detected, tab = ", tabId);

    //   chrome.tabs.executeScript(tab.id, {
    //     file: "marketplaces/closets/kidizen-closet.js",
    //   });
  }

  //mercari listing
  //LATER: maybe do a regex, so that it doesn't only detect us listings?
  if (tab.url.indexOf("mercari.com/us/item") > -1) {
    console.log("mercari listing detected, tab = ", tabId);

    //   chrome.tabs.executeScript(tab.id, {
    //     file: "marketplaces/closets/mercari-closet.js",
    //   });
  }

  //poshmark listing
  if (tab.url.indexOf("poshmark.com/listing") > -1) {
    console.log("poshmark listing actived");
    //   chrome.tabs.executeScript(tab.id, {
    //     file: "marketplaces/closets/poshmark-closet.js",
    //   });
  }
});
