var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

function formatCondition(condition) {
  //return rs condition value from condition value
  switch (condition) {
    case "nwt_yes":
      return "nwt";

    case "nwt_no":
      return "good";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await domEvent.waitForElementToLoad("input[data-vv-name='title']"); //timeout after 10 seconds if undetected

  //wait for page to render
  await helpers.delay(100);

  let imagesEl = document.querySelectorAll(
    ".listing-editor__image-content img"
  );
  let imageURLs = Array.from(imagesEl).map((image) => {
    return $(image).attr("src");
  });

  console.log("imgs original: ", imageURLs);
  let convertedImages = await imageRenderer.convertImages(imageURLs, "url"); //convert type: url => base64

  let poshmark_title = $("input[data-vv-name='title']").val();
  let poshmark_description = $("textarea[data-vv-name='description']").val();
  let poshmark_color = $("div[data-et-name='color'] li") //LATER: //FIX: if item has multiple colors, it gets both of them, just get the first one separate
    .text()
    .trim()
    .toLowerCase();
  let poshmark_brand = $(
    'div[data-et-name="listingEditorBrandSection"] input'
  ).val();
  let poshmark_condition = $(
    ".listing-editor__condition-btn[class*='burgundy']"
  ).attr("data-et-name"); //class of condition button, must include burgundy type, get data et name attribute
  let poshmark_price = $('input[data-vv-name="listingPrice"]').val();
  let poshmark_sku = $('input[data-vv-name="sku"]').val();

  console.log("converted images: ", convertedImages);

  let properties = {
    imageUrls: convertedImages,
    title: poshmark_title,
    description: poshmark_description,
    color: poshmark_color,
    brand: poshmark_brand,
    condition: formatCondition(poshmark_condition),
    price: poshmark_price,
    sku: poshmark_sku,
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
