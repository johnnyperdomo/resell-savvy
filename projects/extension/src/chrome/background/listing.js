//LATER: check if this is user's closet, not just any random user's

//LATER: add a note on the modal saying something like "please ensure this is your closet, rs savvy only works with your personal items"

//LATER: verify urls, some of them prefix "listings" can inlude also the entire listing collection page, so we want to make sure that its "listings/", just verify the pages later on,

//LATER: maybe use an observer to check a specific element from the page exists before showing button, cuz some pages use the same "listing prefix", even if it's not a listing page.

//object of the listing url path of the different marketplaces
const listingPaths = {
  depop: "depop.com/products/",
  ebay: "ebay.com/itm/",
  etsy: "etsy.com/listing/",
  grailed: "grailed.com/listings/",
  kidizen: "kidizen.com/items/",
  mercari: "mercari.com/us/item/", //LATER: maybe do a regex, so that it doesn't only detect 'US' listings, but any listing in any country
  poshmark: "poshmark.com/listing/",
};

function injectListingScript(tabId, marketplace) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: [`chrome/marketplaces/listings/${marketplace}-listing.js`],
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //only inject once when tab status is set to 'loading': to avoid duplicate code injections
  if (changeInfo.status === "loading") {
    for (let [marketplace, path] of Object.entries(listingPaths)) {
      //if listing path detected
      if (tab.url.indexOf(path) > -1) {
        console.info("listing url path detected: ", marketplace, path, tab);
        injectListingScript(tabId, marketplace);
        break;
      }
    }
  }
});
