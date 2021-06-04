var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();

function formatCondition(condition) {
  //return rs condition value from condition value
  switch (condition) {
    case "is_new":
      return "nwt";

    case "is_gently_used":
      return "good";

    case "is_used":
      return "preowned";

    case "is_worn":
      return "poor";

    default:
      return "";
  }
}

async function formatItemPropertiesVersion1() {
  await domEvent.waitForElementToLoad("input[name='title']");

  //wait for page to render
  await helpers.delay(100);

  let imagesEl = document.querySelectorAll(".photo img");
  let imageURLs = Array.from(imagesEl).map((image) => {
    return $(image).attr("src");
  });

  let grailed_title = $("input[name='title']").val();
  let grailed_description = $("textarea[name='description']").val();
  let grailed_color = $("input[name='color']").val().toLowerCase();
  let grailed_brand = $("#designer-autocomplete").val(); //designer
  let grailed_condition = $("select[name='condition']").val();
  let grailed_price = $("input[name='price']").val();

  console.log(
    grailed_title,
    grailed_description,
    grailed_color,
    grailed_brand,
    grailed_condition,
    grailed_price
  );

  let properties = {
    imageUrls: imageURLs,
    title: grailed_title,
    description: grailed_description,
    color: grailed_color,
    brand: grailed_brand,
    condition: formatCondition(grailed_condition),
    price: grailed_price,
    sku: "", //null
    cost: "", //null
  };

  return properties;
}

async function getItemDetails() {
  //TODO: get item details, convert to rs-savvy-format
  //send message to background script
  const properties = await formatItemPropertiesVersion1();

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
