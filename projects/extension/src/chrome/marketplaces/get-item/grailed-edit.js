var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

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

async function formatItemProperties() {
  await domEvent.waitForElementToLoad("input[name='title']");

  //wait for page to render
  await helpers.delay(100);

  let imagesEl = document.querySelectorAll(".photo img");
  let imageURLs = Array.from(imagesEl).map((image) => {
    var url = $(image).attr("src");

    //check if it's the compression url //i.e. https://process.fs.grailed.com/AJdAgnqCST4iPtnUxiGtTz/auto_image/cache=expiry:max/rotate=deg:exif/resize=height:700/output=quality:90/compress/https://cdn.fs.grailed.com/api/file/65ADtJK6SfSJb6YYROG2
    if (url.indexOf("compress/") >= 0) {
      let originalSourceImg = url.split("compress/").pop(); //seperate urls, remove image that is not originalSrc
      url = originalSourceImg;
    }

    return url;
  });

  let convertedImages = await imageRenderer.convertImages(imageURLs, "url"); //convert type: url => base64

  let grailed_title = $("input[name='title']").val();
  let grailed_description = $("textarea[name='description']").val();
  let grailed_color = $("input[name='color']").val().toLowerCase();
  let grailed_brand = $("#designer-autocomplete").val(); //designer
  let grailed_condition = $("select[name='condition']").val();
  let grailed_price = $("input[name='price']").val();

  let properties = {
    imageUrls: convertedImages,
    title: grailed_title,
    description: grailed_description,
    color: grailed_color,
    brand: grailed_brand,
    condition: formatCondition(grailed_condition),
    price: grailed_price,
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
