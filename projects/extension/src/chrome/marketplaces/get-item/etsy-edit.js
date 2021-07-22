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
  };

  return new Promise((resolve, reject) => {
    resolve(properties);
  });
}

async function getItemDetails() {
  //send message to background script
  const properties = await formatItemProperties();

  const data = {
    marketplace: window.listingObject.marketplace,
    listingUrl: window.listingObject.listingUrl,
    listingId: window.listingObject.listingId,
    tab: window.listingObject.tab,
    properties: properties,
  };
  console.log(data);

  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  chrome.runtime.sendMessage({
    command: "import-listing",
    data: data,
  });
}

//listen for message from the import listings
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.command == "set-listing-object") {
    //set listing object, parse stringified json
    window.listingObject = JSON.parse(msg.data.listingObject);

    checkDocumentState();
  }
});

function checkDocumentState() {
  //doc is loaded
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting
  } else {
    //NOTE: sometimes doc can already be complete when script injected; race condition
    swalAlert.showProcessingAlert();

    getItemDetails(); //run process
  }

  document.addEventListener("readystatechange", () => {
    //doc tree is fully ready to be manipulated
    if (document.readyState === "complete") {
      swalAlert.showProcessingAlert();

      getItemDetails(); //run process
    }
  });
}

//NOTE: sometimes ebay fires onbeforeunload messages on the tabs, so the user is prompted with a "are you sure you want to leave message" (this is rarely fired, usually triggered when user interacts with page on import listing, but unfortunately we can't disable this since chrome extension scripts live in isolated worlds) see here: https://superuser.com/questions/705307/how-can-i-disable-are-you-sure-you-want-to-leave-this-page-popups-in-chrome/705308 ; https://developer.chrome.com/docs/extensions/mv2/content_scripts/#isolated_world
