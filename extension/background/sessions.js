//handling communication between marketplaces
//LATER: maybe have some type of ui response so that users can keep know when their item will be tracked.

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //TODO: test remove this later on, just for testing set...
  if (msg.command == "test-ebay") {
    createItem([], "ebay");
  }

  //LATER: maybe a better way to do this later on?
  if (msg.command == "set-ebay-create-listing-active-tab") {
    //TODO: set the tab above for ebay create listing

    let tab = msg.data.tab;
    ebaySetListingActiveTabs.push(tab.id);

    console.log("ebay active tab pushed for get, ", ebaySetListingActiveTabs);
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
        url: "https://www.depop.com/products/edit/johnnyperdomo-this-is-the-coolest-nike/", //TODO: what they will get data from
        active: false,
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["poshmark", "mercari", "kidizen"],
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
          copyToMarketplaces: ["poshmark", "mercari", "kidizen"],
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
          copyToMarketplaces: ["depop", "mercari", "kidizen"],
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
          copyToMarketplaces: [
            "depop",
            "mercari",
            "kidizen",
            "etsy",
            "grailed",
            "poshmark",
          ],
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
        url: "https://www.kidizen.com/items/lightning-bolt-8383962/edit",
        active: false,
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["poshmark"],
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
          copyToMarketplaces: ["depop", "grailed", "kidizen", "poshmark"],
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
        url: "https://poshmark.com/edit-listing/608042cbfdcbf63ef23959f6",
      },
      (tab) => {
        let retrievalObject = {
          copyToMarketplaces: ["depop", "mercari", "kidizen", "etsy"],
          copyFromMarketplace: "poshmark",
          listingURL: "https://www.grailed.com/listings/21859004-adidas-memoji",
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

        openItemInNewTab(tab, properties, "depop");
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
        ebaySetListingActiveTabs.push(tab.id);
        console.log(
          "ebay active tab for set pushed, ",
          ebaySetListingActiveTabs
        );

        let data = { properties: { title: "gymshark pants" }, tab: tab };

        const itemData = JSON.stringify(data);
        chrome.tabs.executeScript(
          tab.id,
          {
            file: `third-party/jquery-3.6.0.min.js`,
          },
          () => {
            chrome.tabs.executeScript(
              tab.id,
              {
                //TODO: pass in tab as well
                code: `const itemData = ${itemData};`,
              },
              () => {
                chrome.tabs.executeScript(tab.id, {
                  file: `marketplaces/new-item/ebay-bulksell-item.js`,
                });
              }
            );
          }
        );
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

        openItemInNewTab(tab, properties, "etsy");
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

        openItemInNewTab(tab, properties, "facebook");
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

        openItemInNewTab(tab, properties, "grailed");
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

        openItemInNewTab(tab, properties, "kidizen");
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

        openItemInNewTab(tab, properties, "mercari");
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

        openItemInNewTab(tab, properties, "poshmark");
      }
    );
  }
}

function openItemInNewTab(tab, data, marketplace) {
  const itemData = JSON.stringify(data);

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `third-party/jquery-3.6.0.min.js`,
    },
    () => {
      chrome.tabs.executeScript(
        tab.id,
        {
          //TODO: pass data in here
          //TODO: not really working
          code: `const itemData = ${itemData};`,
        },
        () => {
          chrome.tabs.executeScript(tab.id, {
            file: `marketplaces/new-item/${marketplace}-item.js`,
          });
        }
      );
    }
  );
}

//Functions ====>
function getListingDetails(tab, data, marketplace) {
  const retrievalObject = JSON.stringify(data);

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `third-party/jquery-3.6.0.min.js`,
      allFrames: true,
    },
    () => {
      chrome.tabs.executeScript(
        tab.id,
        {
          //TODO: pass data in here
          //TODO: not really working
          code: `const retrievalObject = ${retrievalObject};`,
        },
        () => {
          chrome.tabs.executeScript(tab.id, {
            file: `marketplaces/get-item/${marketplace}-edit.js`,
          });
        }
      );
    }
  );
}