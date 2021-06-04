//LATER: create files by pages to make code cleaner

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

async function fillOutGrailedForm(
  imageUrls,
  title,
  description,
  color,
  condition,
  brand,
  price
) {
  await domEvent.waitForElementToLoad("input[name='title']");
  const inputFiles = $('input[type="file"]');
  console.log("input files, ", inputFiles);

  let grailed_title = document.querySelector("input[name='title']");
  let grailed_description = document.querySelector(
    "textarea[name='description']"
  );
  let grailed_color = document.querySelector("input[name='color']");
  let grailed_brand = document.querySelector("#designer-autocomplete"); //designer
  let grailed_condition = document.querySelector("select[name='condition']");
  let grailed_price = document.querySelector("input[name='price']");

  fillInputValue(grailed_title, title);

  if (brand != "") {
    fillInputValue(grailed_brand, brand);

    const brandList = await domEvent.waitForElementToLoad(
      "ul.autocomplete > li"
    );

    if (brandList.length) {
      //LATER: this is not clicking
      brandList.eq(0).trigger("click");
    }
  }

  if (color != "") {
    color = helpers.capitalize(color);
    fillInputValue(grailed_color, color);
  }

  //   const dataTransfer = new DataTransfer();
  //   dataTransfer.items.add(new File(["hello world"], "This_Works.txt"));

  //   console.log("data transfer, " + dataTransfer);

  $(grailed_condition).trigger("click");
  if (condition != "") {
    //TODO: this is not selecting value
    console.log($(grailed_condition).val());
    console.log("condition");
    $(grailed_condition).val("is_used");
    $(grailed_condition).trigger("change");
    // $('select[name="condition"] option[value="is_used"]').attr(
    // //   "selected",
    // //   "selected"
    // // );
    console.log($(grailed_condition).val());
  }

  fillTextAreaValue(grailed_description, description);

  //LATER: currency/price validation
  fillInputValue(grailed_price, price);

  swalAlert.showCrosslistSuccessAlert();
}

function formatCondition(condition) {
  //return grailed condition value from our condition value
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
  fillOutGrailedForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.color,
    itemData.condition,
    itemData.brand,
    itemData.price
  );
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
    console.log("page complete");
  }
};
