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
  await domEvent.waitForElementToLoad("#item_title", 10000);

  //wait for page to render
  await helpers.delay(100);

  let imageURLs = []; //LATER: kidizen doens't show on edit page

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
    cost: "", //null
  };

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

  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  console.log("data, ", data);

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
