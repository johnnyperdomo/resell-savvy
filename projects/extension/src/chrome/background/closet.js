//Listen to when user lands on a closet

//object of the closets of the different marketplace paths

//LATER: //FIX, don't duplicate time code runs -> https://www.youtube.com/watch?v=29dmxQ9QQ4o
const closetPaths = {
  depop: "depop.com/", //NOTE: depop doesn't have a direct closet path, so we detect it in closet script
  ebay: "ebay.com/sh/lst/active",
  etsy: "etsy.com/your/shops",
  grailed: "grailed.com/users/myitems",
  kidizen: "kidizen.com/users", //NOTE: kidizen doesn't have a direct closet path, so we detect it in closet script
  mercari: "mercari.com/mypage/listings",
  poshmark: "poshmark.com/closet/",
  resellsavvy: "app.resellsavvy.com/item/", //for testing purposes
  // resellsavvy: "localhost:4200/item/", //NOTE: DO NOT INCLUDE THIS IN PRODUCTION, or app.resellsavvy.com won't work for testing purposes "*://localhost:*/*"
};

function injectClosetScript(tabId, marketplace) {
  //send tab id

  //inject sweet alert: (for rs-savvy closet)
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["chrome/third-party/sweetalert.min.js"],
    },
    () => {
      //inject button
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: [`chrome/marketplaces/closets/${marketplace}-closet.js`],
        },
        () => {
          chrome.tabs.sendMessage(tabId, {
            command: "set-tab-id",
            data: { tabId: tabId },
          });
        }
      );
    }
  );
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //only inject once when tab status is set to 'loading': to avoid duplicate code injections
  if (changeInfo.status === "loading") {
    for (let [marketplace, path] of Object.entries(closetPaths)) {
      //if closet path detected
      if (tab.url.indexOf(path) > -1) {
        console.info("closet path detected: ", marketplace, path, tab);
        injectClosetScript(tabId, marketplace);
        break;
      }
    }
  }
});

//LATER: see how you can make your web scraping more robust, since data can change on any given page
// https://codeburst.io/two-simple-technique-for-web-scraping-pages-with-dynamically-created-css-class-names-72eaca8c1304
//LATER: your websraping tools should also be done in a way of importance and availability, 'id'(99% of the time unique, and rarely changes), if not available -> 'name'(not necessarily unique, but it can be, and it changes less), 'class'(sometimes not unique, and it can change more often than the other two). i.e., if we're looking for an input, better to look for type input with an id attached rather than a class name: see this tut for more explanation: https://www.youtube.com/watch?v=b5jt2bhSeXs
