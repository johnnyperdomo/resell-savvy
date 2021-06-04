var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();

function formatCondition(condition) {
  //return rs condition value from condition value
  switch (condition) {
    case "1": // ConditionNew
      return "nwt";

    case "2": //ConditionLikenew
      return "nwot";

    case "3": //ConditionGood
      return "good";

    case "4": //ConditionFair
      return "preowned";

    case "5": //ConditionPoor
      return "poor";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await domEvent.waitForElementToLoad('input[data-testid="Title"]');

  //wait for page to render
  await helpers.delay(100);

  let imagesEl = document.querySelectorAll("img[class*='PreviewImage']"); //contains atleast the name 'preview image'
  let imageURLs = Array.from(imagesEl).map((image) => {
    return $(image).attr("src");
  });

  let mercari_title = $('input[data-testid="Title"]').val();
  let mercari_description = $('textarea[data-testid="Description"]').val();

  let mercari_brand = $('input[data-testid="Brand"]').attr("placeholder");
  let mercari_price = $('input[data-testid="Price"]').val();
  let mercari_color = $("#itemColorId").text().trim().toLowerCase();
  let mercari_condition = $('[name="sellCondition"]:checked').attr("id");

  let properties = {
    imageUrls: imageURLs, //kidizen doesn't show on edit page
    title: mercari_title,
    description: mercari_description,
    color: mercari_color, //null
    brand: mercari_brand,
    condition: formatCondition(mercari_condition),
    price: mercari_price,
    sku: "", //null
    cost: "", //null
  };

  console.log(properties);

  return properties;
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
