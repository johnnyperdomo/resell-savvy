function waitForElementToLoad(selector, waitTimeMax, inTree) {
  if (!inTree) inTree = $(document.body);
  let timeStampMax = null;
  if (waitTimeMax) {
    timeStampMax = new Date();
    timeStampMax.setSeconds(timeStampMax.getSeconds() + waitTimeMax);
  }
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      let node = inTree.find(selector);
      if (node.length > 0) {
        console.log("node is ready");
        clearInterval(interval);
        resolve(node);
      } else {
        console.log("node is not ready yet");
      }
      if (timeStampMax && new Date() > timeStampMax) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });
}

async function formatItemProperties() {
  await waitForElementToLoad("input[name='title']");

  return await new Promise((resolve) =>
    setTimeout(() => {
      //image is nested inside button as a css background style
      let imagesEl = document.querySelectorAll(".block-grid-item[data-image]");
      let imageURLs = Array.from(imagesEl).map((image) => {
        let fullURL = $(image).find(".width-full").css("background-image"); //this returns url("{image link goes here}")
        let cleanURL = fullURL.substring(
          fullURL.lastIndexOf("http"),
          fullURL.lastIndexOf('")')
        ); //get url between parentheses

        return cleanURL;
      });

      let etsy_title = $("input[name='title']").val();
      let etsy_description = $("textarea[name='description-text-area']").val();
      let etsy_price = $("input[name='price-input']").val();
      let etsy_sku = $("input[name='sku-input']").val();

      let properties = {
        imageUrls: imageURLs,
        title: etsy_title, //null
        description: etsy_description, //
        color: "", //LATER: get color later
        brand: "", //LATER: append later
        condition: "", //null
        price: etsy_price,
        sku: etsy_sku, //null
        cost: "", //null
      };

      console.log(properties);
      resolve(properties);
    }, 100)
  );
}

async function getItemDetails() {
  //send message to background script
  const properties = await formatItemProperties();

  const data = {
    copyToMarketplaces: retrievalObject.copyToMarketplaces,
    copyFromMarketplace: retrievalObject.copyFromMarketplace,
    listingURL: retrievalObject.listingURL,
    tab: retrievalObject.tab,
    properties: properties,
  };
  console.log(data);

  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  chrome.runtime.sendMessage({
    command: "start-crosslist-session",
    data: data,
  });
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
  }
};
