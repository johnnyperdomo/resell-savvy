//NOTE: kidizen doesn't load images in edit page, their error.
var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();

function formatCondition(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //

    case "New with tag":
      return "nwt";

    case "New without tag":
      return "nwot";

    case ("Very good used condition", "Excellent used condition"):
      return "good";

    case "Good used condition":
      return "preowned";

    case "Play condition":
      return "poor";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await domEvent.waitForElementToLoad("#item_title");

  //wait for page to render
  await helpers.delay(100);

  let imageURLs = []; //LATER: kidizen doens't show on edit page, maybe wait till later when they update page

  let kidizen_title = $("#item_title").val();
  let kidizen_description = $("#item_description").val();
  let kidizen_price = $("#item_list_price").val();

  const brandEl = $("span:contains('Brand')").closest(
    ".DropdownTrigger--required"
  );

  let kidizen_brand = brandEl.find(".DropdownTrigger-selection").text().trim();

  const conditionEl = $("span:contains('Condition')").closest(
    ".DropdownTrigger--required"
  );

  let kidizen_condition = conditionEl
    .find(".DropdownTrigger-selection")
    .text()
    .trim();

  let properties = {
    imageUrls: imageURLs, //kidizen doesn't show on edit page
    title: kidizen_title,
    description: kidizen_description,
    color: "", //null
    brand: kidizen_brand,
    condition: formatCondition(kidizen_condition),
    price: kidizen_price,
    sku: "", //null
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

  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  console.log("data, ", data);

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
