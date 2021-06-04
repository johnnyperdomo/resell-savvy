var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();

async function formatItemPropertiesVersion1() {
  await domEvent.waitForElementToLoad("input[name='title']");

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

  return properties;
}

async function getItemDetails() {
  //send message to background script
  const properties = await formatItemPropertiesVersion1();

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
