//LATER: create files by pages to make code cleaner

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var imageRenderer = new ImageRenderer();
var helpers = new Helpers();

async function fillOutEtsyForm(imageUrls, title, description, price, sku) {
  await domEvent.waitForElementToLoad("input[name='title']");

  let etsy_image_input = document.querySelector("input[type='file']");
  let etsy_title = document.querySelector("input[name='title']");
  let etsy_description = document.querySelector(
    "textarea[name='description-text-area']"
  );
  let etsy_price = document.querySelector("input[name='price-input']");
  let etsy_sku = document.querySelector("input[name='sku-input']");

  //images
  await uploadImages(imageUrls, etsy_image_input);
  //title
  $(etsy_title).trigger("focus");
  domEvent.fillInputValue(etsy_title, title);
  $(etsy_title).trigger("blur");

  //description
  $(etsy_description).trigger("focus");
  domEvent.fillTextAreaValue(etsy_description, description);
  $(etsy_description).trigger("blur");

  //LATER: currency/price validation
  //price
  $(etsy_price).trigger("focus");
  domEvent.fillInputValue(etsy_price, price);
  $(etsy_price).trigger("blur");

  //sku
  $(etsy_sku).trigger("focus");
  domEvent.fillInputValue(etsy_sku, sku);
  $(etsy_sku).trigger("blur");

  swalAlert.closeSwal(); //close modal
  swalAlert.showCrosslistSuccessAlert(); //show success alert
}

function matchCondition(condition) {
  //return etsy condition value from our condition value
  switch (condition) {
    case ("nwt", "nwot"):
      return "is_new";

    case "good":
      return "is_gently_used";

    case "preowned":
      return "is_used";

    case "poor":
      return "is_worn";

    default:
      return "";
  }
}

async function uploadImages(images, targetElement) {
  //wait 100ms for inputs to render
  await helpers.delay(100);

  //truncate image array;
  let splicedImages = images.slice(0, 10); //kidizen only allows 10 image uploads

  //upload array of images simultaneously
  await imageRenderer.uploadImages(splicedImages, targetElement);

  return new Promise((resolve, reject) => {
    resolve();
  });
}

//LATER: do more error checking for fields, example like price/currency validation

//detect if document is ready
document.onreadystatechange = function () {
  //doc tree is loaded
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting;
  }

  if (document.readyState === "complete") {
    swalAlert.showProcessingAlert(); //swal alert ui waiting;
    fillOutEtsyForm(
      itemData.imageUrls,
      itemData.title,
      itemData.description,
      itemData.price,
      itemData.sku
    );
  }
};
