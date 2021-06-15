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
  await domEvent.waitForElementToLoad("#description"); //timeout after 10 seconds if undetected, give time for initial page to render completely

  //LATER: get brand, brand is optional, bcuz it will only show up if user picks category, so keep that in mind, so create a function that waits for element to load, but doesn't freeze ui, or cause to await, if it shows up, manually input(user will see this, but there's nothing you can do about it)

  //wait for page to render
  await helpers.delay(3000); //TODO: //FIX fix this, should not be 3 secs, and we should wait for image to load instead of description

  let imagesEl = document.querySelectorAll('[data-testid*="imageInput"] img');
  let imageURLs = Array.from(imagesEl).map((image) => {
    return $(image).attr("src");
  });

  let convertedImages = await imageRenderer.convertImages(imageURLs, "blob"); //convert type: url => base64

  console.log("converted: ", convertedImages);
  console.log("cvrt: ", convertedImages[0]);

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
    brand: "", //LATER: append later
    condition: formatCondition(depop_condition),
    price: depop_price,
    sku: "", //null
    cost: "", //null
  };

  console.log(properties);

  return new Promise((resolve, reject) => {
    resolve(properties);
  });
}

async function getItemDetails() {
  //TODO: get item details, convert to rs-savvy-format
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
