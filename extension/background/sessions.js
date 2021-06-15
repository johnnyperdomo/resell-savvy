//handling communication between marketplaces

//LATER: when starting crosslist session, make sure if user is logged in, if not, show error message telling them to login

//LATER: learn how to simulate typing like puppeteer, so you can make inputs work better

//LATER: whenever there's a major error like timeout, or crosslist didn't work at all. Show small side popup that says "error, try crosslisting again".

//LATER: create shared class for scraping data, all in one place, make's it easier to read.

//LATER: remove jquery, pure js. jquery can take longer to load and unexpected consequences. we would need to maniuplate dom using normal dom selector api

//LATER: for bug reporting on user's side, console.log errors with a specific message like "RS-SAVVY CROSSLISTING ERRORS", if present, they can copy/paste it the value and give it to the customer service.

var ebaySetListingActiveTabs = {};

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
      cost: "",
    };
    createItem(itemData, "ebay");
  }

  //LATER: maybe a better way to do this later on?
  if (msg.command == "remove-ebay-active-tab") {
    //TODO: set the tab above for ebay create listing

    console.log("remove ebay active tab called", msg.data);

    let tabId = msg.data.tab;

    if (ebaySetListingActiveTabs.hasOwnProperty(tabId)) {
      console.log();
      //remove tabId from object
      delete ebaySetListingActiveTabs[tabId];

      console.log(
        "removed listing active tabs for ebay, ",
        ebaySetListingActiveTabs
      );
    }
  }

  //Start Crosspost session

  if (msg.command == "start-crosslist-session") {
    let tab = msg.data.tab;
    let copyToMarketplaces = Array.from(msg.data.copyToMarketplaces);
    let copyFromMarketplace = msg.data.copyFromMarketplace;
    let listingURL = msg.data.listingURL;
    let itemProperties = msg.data.properties;

    console.log("marketplaces, ", copyToMarketplaces);
    //1. Close Tab
    chrome.tabs.remove(tab.id);

    //TODO: send data request to firebase cloud function api
    //2. Send Data to firebase cloud function

    //3. Open marketplace for each item in array
    copyToMarketplaces.forEach((marketplace) => {
      createItem(itemProperties, marketplace);
    });

    //TODO: open new tabs with marketplaces array
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
          copyToMarketplaces: ["depop"],
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
          copyToMarketplaces: ["poshmark"],
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
          copyToMarketplaces: ["etsy", "kidizen", "mercari", "grailed"],
          copyFromMarketplace: "poshmark",
          listingURL:
            "https://poshmark.com/listing/Nike-Shoes-609710852b46b502a60b0194",
          tab: tab,
        };

        getListingDetails(tab, retrievalObject, "poshmark");
      }
    );
  }

  //LATER: wait for listing data to be retrieved successfully, that way we can tell the client that it is processing, and show them different progress states
});

//Functions ====>

function createItem(properties, marketplace) {
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
    //TODO: ebay has some special configuration

    chrome.tabs.create(
      {
        url: "https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList",
        active: false,
      },
      (tab) => {
        // let data = { properties: { title: "gymshark pants" }, tab: tab };

        // const itemData = JSON.stringify(data);
        // chrome.tabs.executeScript(
        //   tab.id,
        //   {
        //     file: `third-party/jquery-3.6.0.min.js`,
        //   },
        //   () => {
        //     chrome.tabs.executeScript(
        //       tab.id,
        //       {
        //         //TODO: pass in tab as well
        //         code: `const itemData = ${itemData};`,
        //       },
        //       () => {
        //         chrome.tabs.executeScript(tab.id, {
        //           file: `marketplaces/new-item/ebay-bulksell-item.js`,
        //         });
        //       }
        //     );
        //   }
        // );

        injectScriptInNewTab(tab, properties, "ebay-bulksell");

        //set active tab to be listened to, and watch page updates since this listing is a multistep process.
        ebaySetListingActiveTabs[tab.id] = properties;
      }
    );
  }

  //etsy
  if (marketplace == "etsy") {
    //'me' is converted into shop name in url
    chrome.tabs.create(
      {
        url: "https://www.etsy.com/your/shops/me/tools/listings/create",
        active: false,
      },
      (tab) => {
        const itemData = {
          imageUrls: properties.imageUrls,
          title: properties.title,
          description: properties.description,
          price: properties.price,
          brand: properties.brand,
          condition: properties.condition,
          color: properties.color,
          sku: properties.sku,
          cost: properties.cost,
        };

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
  const itemData = JSON.stringify(data);

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
          code: `const itemData = ${itemData};`,
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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //TODO: be careful and make sure we don't post double content script while it's loading, because this event listener can fire multiple times, just once
  console.log("active tabs get, ", ebaySetListingActiveTabs);

  if (ebaySetListingActiveTabs.hasOwnProperty(tabId)) {
    console.log("this tab is active, script will be inject into tab:", tabId);

    let data = ebaySetListingActiveTabs[tabId];

    //  injectScriptInNewTab(tabId, data, "ebay");

    // chrome.tabs.executeScript(tab.id, {
    //   file: `marketplaces/new-item/ebay-item.js`,
    // });

    //TODO: inject script to active tab
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

//images

let url1 =
  "https://assets.adidas.com/images/w_600,f_auto,q_auto/4e894c2b76dd4c8e9013aafc016047af_9366/Superstar_Shoes_White_FV3284_01_standard.jpg";
let url2 =
  "https://di2ponv0v5otw.cloudfront.net/posts/2021/05/08/609710852b46b502a60b0194/m_60c277f012d880e99e359463.jpeg";
let url3 =
  "https://n.shopify.com/s/files/1/0156/6146/products/GEO_LIGHTWEIGHT_SS_T-SHIRT_-_BLACK_A-EditEdit_DW_750x.jpg?v=1571263132";

// Promise.allSettled([getDataUri(url1), getDataUri(url2), getDataUri(url3)]).then(
//   ([result]) => {
//     //reach here regardless

//     console.log("result of the promises: ", result);
//     // {status: "fulfilled", value: 33}
//   }
// );

//TODO: on crosslist popup, let user sort by 1)'name'a-z,z-a, or 2) first/last,
//LATER: later on crosslist modal, add search functionality, when they user starts typing, it goes to the row of what the text is, so if he types "adida", go to the 5th row where that word is that. Find row # and go there, if no row # found, don't go anywhere, but don't filter out results, that way it doesn't make it hard to find the list items that follow, ,  - let users know they can only see or search for items that have been loaded when clicking on the modal(load more to see more)

//NOTE: when showing crosslist modal, don't run a query to compare if user has already crosslisted or if they have that item in their inventory. I've done the research and this can get very expensive, very fast, since this can fetch multiple times. They can do the work themselves of seeing which items need to be imported or not, or which ones have been crosslisted.
//LATER: later on, when a user clicks the crosslist blue button, we can send a request to bigquery, and get a query of all the items(average should be like 100-10,000 max){don't block the modal, just start the modal and in a small corner have a loading spinner that says something like "fetching data"} - big query is pretty affordable, all of this should cost like pennies, even if the user spams, bcuz bigquery caches results. (hopefully function should take like 2-3s i assume.) FIRESTORE can get expensive bcuz it charges on the number of docs retreived, so if it retrieves 10,000. That will be very expensive as hell
