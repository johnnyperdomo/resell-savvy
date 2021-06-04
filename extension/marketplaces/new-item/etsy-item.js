//LATER: create files by pages to make code cleaner

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();

async function fillOutEtsyForm(imageUrls, title, description, price, sku) {
  console.log("waiting on form filler");

  await domEvent.waitForElementToLoad("input[name='title']");
  console.log("called form filler");

  const inputFiles = $('input[type="file"]');

  console.log("input files, ", inputFiles);

  let etsy_title = document.querySelector("input[name='title']");
  let etsy_description = document.querySelector(
    "textarea[name='description-text-area']"
  );
  let etsy_price = document.querySelector("input[name='price-input']");
  let etsy_sku = document.querySelector("input[name='sku-input']");

  fillInputValue(etsy_title, title);
  fillTextAreaValue(etsy_description, description);

  //LATER: currency/price validation
  fillInputValue(etsy_price, price);
  fillInputValue(etsy_sku, sku);

  swalAlert.showCrosslistSuccessAlert();
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

//only this function works to change text
function fillInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  nativeInputValueSetter.call(input, value);

  var inputEvent = new Event("input", { bubbles: true });
  input.dispatchEvent(inputEvent);
}

function fillTextAreaValue(textArea, value) {
  var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;

  nativeTextAreaValueSetter.call(textArea, value);

  var textAreaEvent = new Event("input", { bubbles: true });
  textArea.dispatchEvent(textAreaEvent);
}

//LATER: do more error checking for fields, example like price/currency validation
function getItemDetails() {
  //inherited value
  fillOutEtsyForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.price,
    itemData.sku
  );
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
    console.log("page complete");
  }
};
