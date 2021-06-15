var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

async function formatItemProperties() {
  await domEvent.waitForElementToLoad("input[name='title']"); //wait until el is present

  //wait for page to render
  await helpers.delay(100);

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

  let convertedImages = await imageRenderer.convertImages(imageURLs, "url"); //convert type: url => base64

  let etsy_title = $("input[name='title']").val();
  let etsy_description = $("textarea[name='description-text-area']").val();
  let etsy_price = $("input[name='price-input']").val();
  let etsy_sku = $("input[name='sku-input']").val();

  let properties = {
    imageUrls: convertedImages,
    title: etsy_title, //null
    description: etsy_description, //
    color: "", //LATER: get color later
    brand: "", //LATER: append later
    condition: "", //null
    price: etsy_price,
    sku: etsy_sku, //null
    cost: "", //null
  };

  return new Promise((resolve, reject) => {
    resolve(properties);
  });
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
  //doc tree is loaded
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting
  }

  //doc tree is fully ready to be manipulated
  if (document.readyState === "complete") {
    swalAlert.showProcessingAlert(); //swal alert ui waiting
    getItemDetails();
  }
};
