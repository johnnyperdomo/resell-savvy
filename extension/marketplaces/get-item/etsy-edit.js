showPageLoadingAlert();

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
    showProcessingAlert();
    getItemDetails();
  }
};

function showPageLoadingAlert() {
  //LATER: change background color to make it more presentable, maybe a opaque white?
  //LATER: show gif, or lottie image instead of just a simple loading spinner?
  Swal.fire({
    title: "Waiting on page to load...",
    html: "Please wait a few seconds while we start processing your listing soon. <b>Closing this tab will stop your item from being crosslisted</b>.",
    footer: "Page loading time is affected by your internet speed.",
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
  Swal;
}

function showProcessingAlert() {
  //FIX: //LATER: inherits parent style, fix this. Could it be that we can fix this with an iframe?
  Swal.fire({
    title: "Processing...",
    html: "Please wait a few seconds while we finish processing your listing. <b>Closing this tab will stop your item from being crosslisted</b>.",
    footer: "This tab will auto-close after it finishes processing.",
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
}
