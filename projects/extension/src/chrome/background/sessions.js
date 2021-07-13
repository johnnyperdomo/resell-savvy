//handling communication between marketplaces

//LATER: seperate into seperate functions, and different files to make it cleaner

//LATER: when starting crosslist session, make sure if user is logged in, if not, show error message telling them to login

//LATER: learn how to simulate typing like puppeteer, so you can make inputs work better

//LATER: whenever there's a major error like timeout, or crosslist didn't work at all. Show small side popup that says "error, try crosslisting again".

//LATER: create shared class for scraping data, all in one place, make's it easier to read.

//LATER: remove jquery, pure js. jquery can take longer to load and unexpected consequences. we would need to maniuplate dom using normal dom selector api

//LATER: for bug reporting on user's side, console.log errors with a specific message like "RS-SAVVY CROSSLISTING ERRORS", if present, they can copy/paste it the value and give it to the customer service.

//LATER: when crosslisting, open tabs in queue, instead of opening all the tabs all at once, since this can make the computer very slow when opening the tabs all at once in chrome, and can even freeze the browser. For now, open 10 simultaneously, but later on, let users crosspost a max of 25 items at a time when it auto-queues [chrome hogs alot of resources, so we don't want to have too many tabs open]. you need to add a queue for getting items(so we don't get at the same time,) and setting item. (so we don't set at the same time). Queue should work like this. (1. get item => set item 1 in marketplace, wait for page to finish loading, watch tab updates to see when it's status is complete, go on to marketplace 2 => set => wait => marketplace 3, etc....., when you finish going through all marketplaces, go to item 2, => set item marketplace 1, etc....) That way users can start editing item information, while the pages load. The problem with all at once, is that the tabs all finish loading at the same time which can take a few minutes before we see anything, instead, where if we queue it up in order, it will load a new page every few seconds and be even faster, and users can start editing right away. In the popup js, we will have a loading spinner that says something like "items processing in queue 3/25", they can have the option to cancel the queue if they want. If an item is in queue, they won't be able to crosslist any more items until the queue finishes. (make sure to remove from queue if the tab is taking too long to load, so like give it a minute max for each tab to reach the complete status, if not auto-exit that queue item. Also, if the user closes tab while it's loading, exit out the queue item.)

const marketplaceNewListingFormPaths = {
  depop: "https://www.depop.com/products/create/",
  ebay: "https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList",
  etsy: "https://www.etsy.com/your/shops/me/tools/listings/create",
  grailed: "https://www.grailed.com/sell",
  kidizen: "https://www.kidizen.com/items/new",
  mercari: "https://www.mercari.com/sell/",
  poshmark: "https://poshmark.com/create-listing",
};

function getEditUrlPath(marketplace, listingId) {
  switch (marketplace) {
    case "depop":
      return `https://www.depop.com/products/edit/${listingId}/`;

    case "ebay":
      return `https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList&sellingMode=ReviseItem&lineID=${listingId}`;

    case "etsy":
      return `https://www.etsy.com/your/shops/me/tools/listings/${listingId}`;

    case "grailed":
      return `https://www.grailed.com/listings/${listingId}/edit`;

    case "kidizen":
      return `https://www.kidizen.com/items/${listingId}/edit`;

    case "mercari":
      return `https://www.mercari.com/sell/edit/${listingId}/`;

    case "poshmark":
      return `https://poshmark.com/edit-listing/${listingId}`;

    default:
      return ""; //return empty
  }
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //LATER: maybe a better way to do this later on?
  if (msg.command == "remove-ebay-active-tab") {
    console.log("remove ebay active tab called", msg.data);

    let tabId = msg.data.tab;

    if (
      ebaySetListingActiveTabs.hasOwnProperty(tabId) &&
      ebaySetListingActiveTabs[tabId].stage === "form"
    ) {
      //remove tabId from object
      delete ebaySetListingActiveTabs[tabId];

      console.log(
        "removed listing active tabs for ebay, ",
        ebaySetListingActiveTabs
      );
    }
  }

  //let the browser know in what stage the ebay creation multiprocess listing in, 'title', or 'form'
  if (msg.command == "update-ebay-active-tab-stage") {
    let stage = msg.data.stage;
    let tabId = msg.data.tab.id;

    console.log("before: ", ebaySetListingActiveTabs);

    ebaySetListingActiveTabs[tabId].stage = stage;

    console.log(tabId, stage);
    console.log("update tab listing stage", msg.data);
    console.log("after: ", ebaySetListingActiveTabs);
  }

  //Crosslist Item
  if (msg.command == "crosslist-item") {
    let copyToMarketplaces = Array.from(msg.data.copyToMarketplaces);
    let itemProperties = msg.data.properties;

    copyToMarketplaces.forEach((marketplace) => {
      createItem(itemProperties, marketplace);
    });

    console.log("crosslist initiated ", msg.data);
  }

  //get listing data =====>
  if (msg.command == "start-import-session") {
    let marketplace = msg.data.marketplace;
    let listingUrl = msg.data.listingUrl;
    let listingId = msg.data.listingId;

    //TODO
    let editUrl = getEditUrlPath(marketplace, listingId);

    chrome.tabs.create(
      {
        url: editUrl,
        active: false,
      },
      (tab) => {
        let listingObject = {
          marketplace: marketplace,
          listingUrl: listingUrl,
          listingId: listingId,
          tab: tab,
        };

        getListingDetails(tab, listingObject, marketplace);
      }
    );
  }

  //import items; after import session is completed
  if (msg.command == "import-listing") {
    let tab = msg.data.tab;
    let marketplace = msg.data.marketplace;
    let listingURL = msg.data.listingUrl;
    let itemProperties = msg.data.properties;
    let listingId = msg.data.listingId; //TODO

    //1. Close Tab
    chrome.tabs.remove(tab.id);

    //2. Send Data to firebase cloud function
    createItemInServer(
      itemProperties.imageUrls,
      itemProperties.title,
      itemProperties.description,
      itemProperties.sku,
      itemProperties.color,
      itemProperties.brand,
      itemProperties.condition,
      itemProperties.price,
      marketplace,
      listingURL,
      listingId
    ); //TODO: get real listing id

    console.log("imported item: ", msg.data);
  }
});

//Functions ====>

function createItem(properties, marketplace) {
  //LATER: when crosslisting, make sure properties like color, condition, etc... are in lowercase letters

  //NOTE: Ebay has multiple listing stages since it's a multiprocess creation, stage 'title': when user has to enter title to create listing -> stage 'form', after title is created, user is taken to form stage //set active tab to be listened to, and watch page updates since this listing is a multistep process.

  chrome.tabs.create(
    { url: marketplaceNewListingFormPaths[marketplace], active: false },
    (tab) => {
      switch (marketplace) {
        case "ebay":
          injectScriptInNewTab(tab, properties, "ebay-bulksell");
          ebaySetListingActiveTabs[tab.id] = { stage: "title", properties };

          break;

        default:
          injectScriptInNewTab(tab, properties, marketplace);

          break;
      }
    }
  );
}

function injectScriptInNewTab(tab, data, marketplace) {
  data["tab"] = tab; //add tab properties to data object
  var itemData = JSON.stringify(data);

  console.log("script inject");

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `chrome/third-party/jquery-3.6.0.min.js`,
      runAt: "document_start",
    },
    () => {
      chrome.tabs.executeScript(
        tab.id,
        {
          code: `var itemData = ${itemData};`,
          runAt: "document_start",
        },
        () => {
          chrome.tabs.executeScript(tab.id, {
            file: `chrome/marketplaces/new-item/${marketplace}-item.js`,
            runAt: "document_start",
          });
        }
      );
    }
  );
}

//Functions ====>
function createItemInServer(
  imageUrls,
  title,
  desc,
  sku,
  color,
  brand,
  condition,
  price,
  from_marketplace,
  listingUrl,
  listingId
) {
  const properties = {
    imageUrls: imageUrls,
    title: title,
    description: desc,
    sku: sku,
    color: color,
    brand: brand,
    condition: condition,
    price: price,
  }; //NOTE: don't edit keys, modeled after api

  const listing = {
    from_marketplace: from_marketplace,
    url: listingUrl,
    id: listingId,
  }; //NOTE: don't edit keys, modeled after api

  apiCreateItem(properties, listing); //file: firebase.js
}

function getListingDetails(tab, data, marketplace) {
  const listingObject = JSON.stringify(data);

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `chrome/third-party/jquery-3.6.0.min.js`,
      runAt: "document_start",
    },
    () => {
      chrome.tabs.executeScript(
        tab.id,
        {
          code: `const listingObject = ${listingObject};`,
          runAt: "document_start",
        },
        () => {
          chrome.tabs.executeScript(tab.id, {
            file: `chrome/marketplaces/get-item/${marketplace}-edit.js`,
            runAt: "document_start",
          });
        }
      );
    }
  );
}

//listen to active ebay tabs
var ebaySetListingActiveTabs = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("active tabs get, ", ebaySetListingActiveTabs);
  console.log("tab info:", tab);

  //if this is an active ebay tab, and, if the tab is at the ('form' - stage), inject script in tab that fills in ebay form
  if (
    ebaySetListingActiveTabs.hasOwnProperty(tabId) &&
    ebaySetListingActiveTabs[tabId].stage === "form"
  ) {
    console.log("this tab is active, script will be inject into tab:", tabId);
    let data = ebaySetListingActiveTabs[tabId];

    injectScriptInNewTab(tabId, data, "ebay");
  }
});

//listen to ebay tabs that were removed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  //ebay active tab is removed on script completion or tab removal, whichever comes first
  console.log("tab removed: ", tabId, removeInfo);

  if (ebaySetListingActiveTabs.hasOwnProperty(tabId)) {
    //remove tabId from object
    delete ebaySetListingActiveTabs[tabId];

    console.log(
      "new get listing active tabs for ebay, ",
      ebaySetListingActiveTabs
    );
  }
});

//LATER: later on crosslist modal, add search functionality, when they user starts typing, it goes to the row of what the text is, so if he types "adida", go to the 5th row where that word is that. Find row # and go there, if no row # found, don't go anywhere, but don't filter out results, that way it doesn't make it hard to find the list items that follow, ,  - let users know they can only see or search for items that have been loaded when clicking on the modal(load more to see more)

//NOTE: when showing crosslist modal, don't run a query to compare if user has already crosslisted or if they have that item in their inventory. I've done the research and this can get very expensive, very fast, since this can fetch multiple times. They can do the work themselves of seeing which items need to be imported or not, or which ones have been crosslisted.
