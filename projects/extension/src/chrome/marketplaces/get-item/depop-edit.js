var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

function formatCondition(condition) {
  //return rs condition value from condition value
  //LATER:later maybe check the cases with everything lowercased values, so we don't run into any issues based on capitalized letters
  switch (condition) {
    case "Brand new":
      return "nwt";

    case "Like new":
      return "nwot";

    case "Excellent":
      return "good";

    case "Good":
      return "preowned";

    case "Fair":
      return "poor";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await domEvent.waitForElementToLoad('[data-testid*="imageInput"] img'); //NOTE: await for imgs here, since they load after the title

  //LATER: get brand, brand is optional, bcuz it will only show up if user picks category, so keep that in mind, so create a function that waits for element to load, but doesn't freeze ui, or cause to await, if it shows up, manually input(user will see this, but there's nothing you can do about it)

  //wait for page to render
  await helpers.delay(100);

  let imagesEl = document.querySelectorAll('[data-testid*="imageInput"] img');
  let imageURLs = Array.from(imagesEl).map((image) => {
    return $(image).attr("src");
  });

  let convertedImages = await imageRenderer.convertImages(imageURLs, "blob"); //convert type: url => base64

  let depop_description = $("#description").val();
  let depop_color = $(
    '[data-testid="listingSelect__listing__colour"] div[class*="label"]'
  )
    .text()
    .trim()
    .toLowerCase();

  let depop_condition = $(
    '[data-testid="listingSelect__listing__condition"] div[class*="listingSelect__value-container"]'
  )
    .text()
    .trim(); //class of condition button, must include burgundy type, get data et name attribute
  let depop_price = $('input[data-testid="price__input"]').val();

  let properties = {
    imageUrls: convertedImages,
    title: "", //null
    description: depop_description, //
    color: depop_color,
    brand: "", //LATER: append later //FIX:
    condition: formatCondition(depop_condition),
    price: depop_price,
    sku: "", //null
  };

  console.log(properties);

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
    console.log("set listing objected detected: ", msg);

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
