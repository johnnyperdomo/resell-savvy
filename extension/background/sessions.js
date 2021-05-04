//handling communication between marketplaces
//LATER: maybe have some type of ui response so that users can keep know when their item will be tracked.
//TODO: save global array to keep track of process

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //Create listing items =====>

  //depop
  if (msg.command == "create-depop-item") {
    chrome.tabs.create(
      { url: "https://www.depop.com/products/create/" },
      (tab) => {
        //TODO: execute script

        //TODO get data from message

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

        createItemInNewTab(tab, itemData, "depop");
      }
    );
    //TODO: save tab info to process array
  }

  //ebay
  if (msg.command == "create-ebay-item") {
    //TODO: ebay has some special configuration
  }

  //etsy
  if (msg.command == "create-etsy-item") {
    //'me' is converted into shop name in url
    chrome.tabs.create(
      { url: "https://www.etsy.com/your/shops/me/tools/listings/create" },
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

        createItemInNewTab(tab, itemData, "etsy");
      }
    );
  }

  //facebook
  if (msg.command == "create-facebook-item") {
    chrome.tabs.create(
      { url: "https://www.facebook.com/marketplace/create/item" },
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

        createItemInNewTab(tab, itemData, "facebook");
      }
    );
  }

  //grailed
  if (msg.command == "create-grailed-item") {
    chrome.tabs.create({ url: "https://www.grailed.com/sell" }, (tab) => {
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

      createItemInNewTab(tab, itemData, "grailed");
    });
  }

  //kidizen
  if (msg.command == "create-kidizen-item") {
    chrome.tabs.create({ url: "https://www.kidizen.com/items/new" }, (tab) => {
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

      createItemInNewTab(tab, itemData, "kidizen");
    });
  }

  //mercari
  if (msg.command == "create-mercari-item") {
    chrome.tabs.create({ url: "https://www.mercari.com/sell/" }, (tab) => {
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

      createItemInNewTab(tab, itemData, "mercari");
    });
  }

  //poshmark
  if (msg.command == "create-poshmark-item") {
    console.log("poshmark message received");

    chrome.tabs.create(
      { url: "https://poshmark.com/create-listing" },
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
          sku: "",
          cost: 5,
        };

        createItemInNewTab(tab, itemData, "poshmark");
      }
    );
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("updated, ", tabId, changeInfo, tab);
  //TODO: listen for url changes, watch for when user lands on success page (specific for tab), or when

  //TODO: if success page, get the listing url, and then call cloud function api to post to firebase (verify the successs data in the cloud function, if new, upload data to item. else, if already created, jsut save new url.) - api to make it super fast
});

chrome.tabs.onRemoved.addListener((tabId) => {
  //TODO: if tab removed, remove this from the process
});

// {
//   "js": ["jquery-3.6.0.min.js", "marketplaces/depop.js"],
//   "matches": ["*://www.depop.com/*"],
//   "run_at": "document_start"
// },

//Functions ====>
function createItemInNewTab(tab, data, marketplace) {
  const itemData = JSON.stringify(data);

  chrome.tabs.executeScript(
    tab.id,
    {
      file: `jquery-3.6.0.min.js`,
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
            file: `marketplaces/${marketplace}.js`,
          });
        }
      );
    }
  );
}
