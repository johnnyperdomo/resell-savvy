//LATER: check if this is user's closet, not just any random user's

//LATER: add a note on the modal saying something like "please ensure this is your closet, rs savvy only works with your personal items"

//LATER: verify urls, some of them prefix "listings" can inlude also the entire listing collection page, so we want to make sure that its "listings/", just verify the pages later on,

//LATER: maybe use an observer to check a specific element from the page exists before showing button, cuz some pages use the same "listing prefix", even if it's not a listing page.

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //depop listing
  if (tab.url.indexOf("depop.com/products") > -1) {
    console.log("depop item detected");

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/depop-listing.js",
    });
  }

  //ebay listing
  //TODO: bulk sell page works so don't worry about it
  if (tab.url.indexOf("ebay.com/itm") > -1) {
    console.log("ebay listing detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/ebay-listing.js",
    });
  }

  //etsy listing
  //TODO: wait for element to load, heading, before detecting closet
  if (tab.url.indexOf("etsy.com/listing") > -1) {
    console.log("etsy listing detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/etsy-listing.js",
    });
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

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/grailed-listing.js",
    });
  }

  //kidizen listing
  //TODO:
  if (tab.url.indexOf("kidizen.com/items/") > -1) {
    console.log("kidizen listing detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/kidizen-listing.js",
    });
  }

  //mercari listing
  //LATER: maybe do a regex, so that it doesn't only detect us listings?
  if (tab.url.indexOf("mercari.com/us/item") > -1) {
    console.log("mercari listing detected, tab = ", tabId);

    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/mercari-listing.js",
    });
  }

  //poshmark listing
  if (tab.url.indexOf("poshmark.com/listing") > -1) {
    console.log("poshmark listing actived");
    chrome.tabs.executeScript(tab.id, {
      file: "marketplaces/listings/poshmark-listing.js",
    });
  }
});
