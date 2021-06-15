var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

function detectEbayListingVersion() {
  //detect using a unique element from each version

  //ebay listing version 1
  domEvent.waitForElementToDisplay(
    "#editpane_form",
    function () {
      console.log("detected ebay v1");
      getItemDetails("one");
    },
    100,
    1000000000000
  );

  //ebay listing version 2
  domEvent.waitForElementToDisplay(
    ".summary__container",
    function () {
      console.log("detected ebay v2");
      getItemDetails("two");
    },
    100,
    1000000000000
  );
}

async function getItemDetails(version) {
  //send message to background script

  //ebay version 1 or 2
  if (version == "one") {
    const properties = await formatItemPropertiesVersionOne();

    const data = {
      copyToMarketplaces: retrievalObject.copyToMarketplaces,
      copyFromMarketplace: retrievalObject.copyFromMarketplace,
      listingURL: retrievalObject.listingURL,
      tab: retrievalObject.tab,
      properties: properties,
    };
    console.log("data from version one, ", data);

    sendMessageToBackground(data);
  } else if (version == "two") {
    const properties = await formatItemPropertiesVersionTwo();

    const data = {
      copyToMarketplaces: retrievalObject.copyToMarketplaces,
      copyFromMarketplace: retrievalObject.copyFromMarketplace,
      listingURL: retrievalObject.listingURL,
      tab: retrievalObject.tab,
      properties: properties,
    };
    console.log("data from version two, ", data);

    sendMessageToBackground(data);
  }
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
    detectEbayListingVersion();
    console.log("hi");
  }
};

//=====================> Ebay Listing Version 1

async function formatItemPropertiesVersionOne() {
  //LATER: some categories have color property(such as handbags), search to see if color exists, if it does, get
  await domEvent.waitForElementToLoad("#editpane_title"); //timeout after 10 seconds if undetected, give time for initial page to render completely

  //wait for page to render,
  //wait 3 seconds for iframe to load
  await helpers.delay(100);

  //hidden uploader form with input values, alternative solution would be in iframe
  let imageURLs = $("#epsUrls").val().split(";");

  let convertedImages = await imageRenderer.convertImages(imageURLs, "url"); //convert type: url => base64

  let ebay_title = $("#editpane_title").val();
  let ebay_description = $('iframe[id*="txtEdit_st"]')
    .contents()
    .find("body")[0].innerText;
  let ebay_brand = $("input[fieldname='Brand']").val();
  let ebay_condition = $("select[name='itemCondition']").val();
  let ebay_price = $("#binPrice").val(); //TODO: check ebay to see what would it be for an auction listing
  let ebay_sku = $("#editpane_skuNumber").val();

  console.log(ebay_description);

  let properties = {
    imageUrls: convertedImages,
    title: ebay_title,
    description: ebay_description,
    color: "", //null
    brand: ebay_brand,
    condition: formatConditionVersionOne(ebay_condition),
    price: ebay_price,
    sku: ebay_sku,
    cost: "", //null
  };

  console.log(properties);
  return new Promise((resolve, reject) => {
    resolve(properties);
  });
}

function formatConditionVersionOne(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //LATER: some ebay conditions may be different based on category. so reconfigure this later to just pull new if nwt, or default to the second one
    case "1000": //NEW
      return "nwt";

    case "3000": //USED
      return "good";

    default:
      return "";
  }
}

////=====================> Ebay Listing Version 2

async function formatItemPropertiesVersionTwo() {
  //LATER: some categories have color property(such as handbags), search to see if color exists, if it does, get
  await domEvent.waitForElementToLoad("input[name='title']");

  //wait for page to render,
  //wait 3 seconds for iframe to load
  await helpers.delay(100);

  //image is nested inside button as a css background style
  let imagesEl = document.querySelectorAll("button.uploader-thumbnails__image");
  let imageURLs = Array.from(imagesEl).map((image) => {
    let fullURL = $(image).css("background-image"); //this returns url("{image link goes here}")
    let cleanURL = fullURL.substring(
      fullURL.lastIndexOf("http"),
      fullURL.lastIndexOf('")')
    ); //get url between parentheses

    //regex replace thumbnail size of _(random int).JPG, with full image _57
    return cleanURL.replace(/_[\d]+\.JPG/, "_57.JPG");
  });

  let convertedImages = await imageRenderer.convertImages(imageURLs, "url"); //convert type: url => base64

  let ebay_title = $("input[name='title']").val();

  //LATE
  let ebay_description = $(".summary__description iframe")
    .contents()
    .find("body")[0].innerText;

  let ebay_brand = $('button[_track*="_Brand."]').text();
  //LATER: get condition by checking if it says new, if not default to used
  let ebay_condition = $('button[_track*=".condition."]').text().toLowerCase();
  let ebay_price = $("input[name='price']").val(); //LATER: check ebay to see what would it be for an auction listing
  let ebay_sku = $("input[name='customLabel']").val();

  let properties = {
    imageUrls: convertedImages,
    title: ebay_title,
    description: ebay_description,
    color: "", //null
    brand: ebay_brand,
    condition: formatConditionVersionTwo(ebay_condition),
    price: ebay_price,
    sku: ebay_sku,
    cost: "", //null
  };

  console.log(properties);
  return new Promise((resolve, reject) => {
    resolve(properties);
  });
}

function formatConditionVersionTwo(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //LATER: some ebay conditions may be different based on category. so reconfigure this later to just pull new if nwt, or default to the second one

    case "new": //NEW
      return "nwt";

    case "used": //USED
      return "good";

    default:
      return "";
  }
}

// {
//   "matches": [
//     "https://bulksell.ebay.com/ws/eBayISAPI.dll*",
//     "https://www.ebay.com/lstng*"
//   ],
//   "js": [
//     "third-party/jquery-3.6.0.min.js",
//     "marketplaces/new-item/ebay-item.js"
//   ],
//   "all_frames": true
// },
