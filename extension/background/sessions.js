//handling communication between marketplaces

//LATER: seperate into seperate functions, and different files to make it cleaner

//LATER: when starting crosslist session, make sure if user is logged in, if not, show error message telling them to login

//LATER: learn how to simulate typing like puppeteer, so you can make inputs work better

//LATER: whenever there's a major error like timeout, or crosslist didn't work at all. Show small side popup that says "error, try crosslisting again".

//LATER: create shared class for scraping data, all in one place, make's it easier to read.

//LATER: remove jquery, pure js. jquery can take longer to load and unexpected consequences. we would need to maniuplate dom using normal dom selector api

//LATER: for bug reporting on user's side, console.log errors with a specific message like "RS-SAVVY CROSSLISTING ERRORS", if present, they can copy/paste it the value and give it to the customer service.

//LATER: when crosslisting, open tabs in queue, instead of opening all the tabs all at once, since this can make the computer very slow when opening the tabs all at once in chrome, and can even freeze the browser. For now, open 10 simultaneously, but later on, let users crosspost a max of 25 items at a time when it auto-queues [chrome hogs alot of resources, so we don't want to have too many tabs open]. you need to add a queue for getting items(so we don't get at the same time,) and setting item. (so we don't set at the same time). Queue should work like this. (1. get item => set item 1 in marketplace, wait for page to finish loading, watch tab updates to see when it's status is complete, go on to marketplace 2 => set => wait => marketplace 3, etc....., when you finish going through all marketplaces, go to item 2, => set item marketplace 1, etc....) That way users can start editing item information, while the pages load. The problem with all at once, is that the tabs all finish loading at the same time which can take a few minutes before we see anything, instead, where if we queue it up in order, it will load a new page every few seconds and be even faster, and users can start editing right away. In the popup js, we will have a loading spinner that says something like "items processing in queue 3/25", they can have the option to cancel the queue if they want. If an item is in queue, they won't be able to crosslist any more items until the queue finishes. (make sure to remove from queue if the tab is taking too long to load, so like give it a minute max for each tab to reach the complete status, if not auto-exit that queue item. Also, if the user closes tab while it's loading, exit out the queue item.)

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //TODO: test remove this later on, just for testing set...
  if (msg.command == "test-ebay") {
    const itemData = {
      imageUrls: [],
      title: "Fanny pack",
      description: "ebay desc",
      price: "98",
      brand: "Adidas",
      condition: "nwt",
      color: "",
      sku: "123edfgreet",
    };
    createItem(itemData, "ebay");
  }

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

  //Start Crosspost session

  if (msg.command == "start-crosslist-session") {
    let tab = msg.data.tab;
    let copyToMarketplaces = Array.from(msg.data.copyToMarketplaces);
    let fromMarketplace = msg.data.copyFromMarketplace;
    let listingURL = msg.data.listingURL;
    let itemProperties = msg.data.properties;

    console.log("marketplaces, ", copyToMarketplaces);
    //1. Close Tab
    chrome.tabs.remove(tab.id);

    //TODO: initilialize after project ready to be launched
    //2. Send Data to firebase cloud function
    // createItemInServer(
    //   itemProperties.imageUrls,
    //   itemProperties.title,
    //   itemProperties.description,
    //   itemProperties.sku,
    //   itemProperties.color,
    //   itemProperties.brand,
    //   itemProperties.condition,
    //   itemProperties.price,
    //   fromMarketplace,
    //   listingURL,
    //   "123423453"
    // ); //TODO: get real listing id

    //3. Open marketplace for each item in array
    copyToMarketplaces.forEach((marketplace) => {
      createItem(itemProperties, marketplace);
    }); //TODO

    console.log("message received: ", msg.data);
  }

  //get listing data =====>

  //depop
  if (msg.command == "get-listing-from-depop") {
    //TODO: set data id
    chrome.tabs.create(
      {
        url: "https://www.depop.com/products/edit/johnnyperdomo-nike-limited-edition-shirt/", //TODO: what they will get data from
        active: false,
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["grailed"],
          copyFromMarketplace: "depop",
          listingURL: "https://www.grailed.com/listings/21859004-adidas-memoji", //TODO: the actual listing url
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "depop");
      }
    );
  }

  //ebay
  if (msg.command == "get-listing-from-ebay") {
    //NOTE: Ebay has two different listing versions, the script checks the version first before manipulating the dom
    //TODO: set correct data
    chrome.tabs.create(
      {
        url: "https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList&sellingMode=ReviseItem&ReturnURL=https%3A%2F%2Fwww.ebay.com%2Fsh%2Flst%2Factive&lineID=363389338870",
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["poshmark"],
          copyFromMarketplace: "ebay",
          listingURL: "https://www.ebay.com/itm/363389338870", //TODO: the actual listing url
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "ebay");
      }
    );
  }

  //etsy
  if (msg.command == "get-listing-from-etsy") {
    //TODO: set data id
    chrome.tabs.create(
      {
        url: "https://www.etsy.com/your/shops/me/tools/listings/1013280995",
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["depop"],
          copyFromMarketplace: "etsy",
          listingURL: "https://www.grailed.com/listings/21859004-adidas-memoji",
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "etsy");
      }
    );
  }

  //grailed
  if (msg.command == "get-listing-from-grailed") {
    //TODO: set data id
    chrome.tabs.create(
      {
        url: "https://www.grailed.com/listings/21859004/edit",
        active: false,
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["ebay"],
          copyFromMarketplace: "grailed",
          listingURL: "https://www.grailed.com/listings/21859004-adidas-memoji",
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "grailed");
      }
    );
  }

  //kidizen
  if (msg.command == "get-listing-from-kidizen") {
    //TODO: set data id
    chrome.tabs.create(
      {
        url: "https://www.kidizen.com/items/memoji-sticker-8376797/edit",
        active: false,
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["grailed"],
          copyFromMarketplace: "kidizen",
          listingURL: "https://www.grailed.com/listings/21859004-adidas-memoji",
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "kidizen");
      }
    );
  }

  //mercari
  if (msg.command == "get-listing-from-mercari") {
    //TODO: set data id
    chrome.tabs.create(
      {
        url: "https://www.mercari.com/sell/edit/m51684724871/",
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["ebay"],
          copyFromMarketplace: "mercari",
          listingURL: "https://www.grailed.com/listings/21859004-adidas-memoji",
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "mercari");
      }
    );
  }

  //poshmark
  if (msg.command == "get-listing-from-poshmark") {
    //TODO: set data id

    chrome.tabs.create(
      {
        url: "https://poshmark.com/edit-listing/609710852b46b502a60b0194",
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: [
            "depop",
            "grailed",
            "etsy",
            "mercari",
            "kidizen",
          ],
          copyFromMarketplace: "poshmark",
          listingURL:
            "https://poshmark.com/listing/Nike-Shoes-609710852b46b502a60b0194",
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "poshmark");
      }
    );
  }
});

//Functions ====>

function createItem(properties, marketplace) {
  //TODO: when crosslisting, make sure properties like color, condition, etc... are in lowercase letters
  if (marketplace == "depop") {
    chrome.tabs.create(
      { url: "https://www.depop.com/products/create/", active: false },
      (tab) => {
        //TODO: execute script

        //TODO get data from message

        injectScriptInNewTab(tab, properties, "depop");
      }
    );
    //TODO: save tab info to process array
  }

  //ebay
  //NOTE: ebay has special configurations since the listing creation pages is paginated
  if (marketplace == "ebay") {
    chrome.tabs.create(
      {
        url: "https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList",
        active: false,
      },
      (tab) => {
        injectScriptInNewTab(tab, properties, "ebay-bulksell");

        //NOTE: Ebay has multiple listing stages since it's a multiprocess creation, stage 'title': when user has to enter title to create listing -> stage 'form', after title is created, user is taken to form stage //set active tab to be listened to, and watch page updates since this listing is a multistep process.
        ebaySetListingActiveTabs[tab.id] = { stage: "title", properties };
      }
    );
  }

  //etsy
  if (marketplace == "etsy") {
    //'me' is converted into shop name in etsy url
    chrome.tabs.create(
      {
        url: "https://www.etsy.com/your/shops/me/tools/listings/create",
        active: false,
      },
      (tab) => {
        injectScriptInNewTab(tab, properties, "etsy");
      }
    );
  }

  //facebook
  if (marketplace == "facebook") {
    chrome.tabs.create(
      {
        url: "https://www.facebook.com/marketplace/create/item",
        active: false,
      },
      (tab) => {
        const itemData = {
          imageUrls: [],
          title: "nike shirt premium",
          description:
            "This is the coolest nike shirt you have to get it, it's brand new my guy. Check it out.",
          price: 29,
          brand: "Adidas",
          condition: "nwt",
          color: "red",
          sku: "ID456",
          cost: 5,
        };

        injectScriptInNewTab(tab, properties, "facebook");
      }
    );
  }

  //grailed
  if (marketplace == "grailed") {
    chrome.tabs.create(
      { url: "https://www.grailed.com/sell", active: false },
      (tab) => {
        const itemData = {
          imageUrls: [],
          title: "nike shirt premium",
          description:
            "This is the coolest nike shirt you have to get it, it's brand new my guy. Check it out.",
          price: 29,
          brand: "Adidas",
          condition: "nwt",
          color: "red",
          sku: "ID456",
          cost: 5,
        };

        injectScriptInNewTab(tab, properties, "grailed");
      }
    );
  }

  //kidizen
  if (marketplace == "kidizen") {
    console.log("called kidizen");
    chrome.tabs.create(
      { url: "https://www.kidizen.com/items/new", active: false },
      (tab) => {
        const itemData = {
          imageUrls: [],
          title: "nike shirt premium",
          description:
            "This is the coolest nike shirt you have to get it, it's brand new my guy. Check it out.",
          price: 29,
          brand: "Adidas",
          condition: "nwt",
          color: "red",
          sku: "ID456",
          cost: 5,
        };

        injectScriptInNewTab(tab, properties, "kidizen");
      }
    );
  }

  //mercari
  if (marketplace == "mercari") {
    chrome.tabs.create(
      { url: "https://www.mercari.com/sell/", active: false },
      (tab) => {
        const itemData = {
          imageUrls: [],
          title: "nike shirt premium",
          description:
            "This is the coolest nike shirt you have to get it, it's brand new my guy. Check it out.",
          price: 29,
          brand: "Adidas",
          condition: "nwt",
          color: "red",
          sku: "ID456",
          cost: 5,
        };

        injectScriptInNewTab(tab, properties, "mercari");
      }
    );
  }

  //poshmark
  if (marketplace == "poshmark") {
    console.log("poshmark message received");

    chrome.tabs.create(
      { url: "https://poshmark.com/create-listing", active: false },
      (tab) => {
        const itemData = {
          imageUrls: [],
          title: "adidas pants",
          description:
            "This is the coolest adidas you have to get it, it's brand new my guy. Check it out.",
          price: 29,
          brand: "Adidas",
          condition: "nwot",
          color: "green",
          sku: "",
          cost: 5,
        };

        injectScriptInNewTab(tab, properties, "poshmark");
      }
    );
  }
}

function injectScriptInNewTab(tab, data, marketplace) {
  data["tab"] = tab; //add tab properties to data object
  var itemData = JSON.stringify(data);

  console.log("script inject");

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `third-party/jquery-3.6.0.min.js`,
      runAt: "document_start",
    },
    () => {
      chrome.tabs.executeScript(
        tab.id,
        {
          //TODO: pass data in here
          //TODO: not really working
          code: `var itemData = ${itemData};`,
          runAt: "document_start",
        },
        () => {
          chrome.tabs.executeScript(tab.id, {
            file: `marketplaces/new-item/${marketplace}-item.js`,
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
  };

  const listing = {
    from_marketplace: from_marketplace,
    url: listingUrl,
    id: listingId,
  };

  apiCreateItem(properties, listing); //file: firebase.js

  console.log("called server from session.js; ");
}

function getListingDetails(tab, data, marketplace) {
  const retrievalObject = JSON.stringify(data);

  console.log("get script injected");

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `third-party/jquery-3.6.0.min.js`,
      runAt: "document_start",
    },
    () => {
      chrome.tabs.executeScript(
        tab.id,
        {
          //TODO: pass data in here
          //TODO: not really working
          code: `const retrievalObject = ${retrievalObject};`,
          runAt: "document_start",
        },
        () => {
          chrome.tabs.executeScript(tab.id, {
            file: `marketplaces/get-item/${marketplace}-edit.js`,
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
  //TODO: be careful and make sure we don't post double content script while it's loading, because this event listener can fire multiple times, just once

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

//TODO: on crosslist popup, let user sort by 1)'name'a-z,z-a, or 2) first/last,
//LATER: later on crosslist modal, add search functionality, when they user starts typing, it goes to the row of what the text is, so if he types "adida", go to the 5th row where that word is that. Find row # and go there, if no row # found, don't go anywhere, but don't filter out results, that way it doesn't make it hard to find the list items that follow, ,  - let users know they can only see or search for items that have been loaded when clicking on the modal(load more to see more)

//NOTE: when showing crosslist modal, don't run a query to compare if user has already crosslisted or if they have that item in their inventory. I've done the research and this can get very expensive, very fast, since this can fetch multiple times. They can do the work themselves of seeing which items need to be imported or not, or which ones have been crosslisted.
//LATER: later on, when a user clicks the crosslist blue button, we can send a request to bigquery, and get a query of all the items(average should be like 100-10,000 max){don't block the modal, just start the modal and in a small corner have a loading spinner that says something like "fetching data"} - big query is pretty affordable, all of this should cost like pennies, even if the user spams, bcuz bigquery caches results. (hopefully function should take like 2-3s i assume.) FIRESTORE can get expensive bcuz it charges on the number of docs retreived, so if it retrieves 10,000. That will be very expensive as hell
