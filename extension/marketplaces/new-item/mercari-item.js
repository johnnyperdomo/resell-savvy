//LATER: create files by pages to make code cleaner
var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

async function fillOutMercariForm(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  price
) {
  console.log("waiting on form filler");

  await domEvent.waitForElementToLoad("#sellName");
  console.log("called form filler");
  let mercari_title = document.querySelector('input[data-testid="Title"]');
  let mercari_description = document.querySelector(
    'textarea[data-testid="Description"]'
  );

  let mercari_brand = document.querySelector('input[data-testid="Brand"]');
  let mercari_price = document.querySelector('input[data-testid="Price"]');
  let mercari_color = document.querySelector('button[data-testid="Color"]');

  fillInputValue(mercari_title, title);
  fillTextAreaValue(mercari_description, description);

  if (brand != "") {
    fillInputValue(mercari_brand, brand);

    //TODO: this giving alot of problems, not working correctly
    let brandList = await domEvent.waitForElementToLoad(
      'div[data-testid="BrandDropdown"] > div > div'
    );

    // console.log(nestedDivs);
    //TODO: handle waitfor element errors, if not found. This brand should not work, but it should still continue running the other code. We should do like a wait for element, but time out after a few seconds. If not it just continues looping forever and blocks the next inputs

    if (brandList.length) {
      brandList.eq(0).trigger("click");
    }
  }

  if (condition != "") {
    let conditionValue = matchCondition(condition);

    $(`label[data-testid="${conditionValue}"]`).trigger("click");
  }

  if (color != "") {
    $(mercari_color).trigger("click");

    color = helpers.capitalize(color);

    let searchColor = await domEvent.waitForElementToLoad(
      `li:contains('${color}')`
    );

    searchColor.trigger("click");
  }

  //LATER: any number if available, round up, bcuz mercari doesn't accept decimals //FIX
  fillInputValue(mercari_price, price);

  //TODO: you need to simulate user inputs for it to validate the inputs before submiting //focus //LATER input not detecting change right away, but works if they click inside input and then click out. for 'title and description'
  // $(mercari_title)
  //   .trigger("input")
  //   .trigger("blur")
  //   .trigger("keyup", { keyCode: 50 });
  // $(mercari_title).trigger("keyup");
  // $(mercari_description).trigger("input").trigger("blur");

  //   $('button[data-testid="PhotoUploadButton"]').trigger("click");
  // $("#categoryId").trigger("click");
  // console.log("clicked the category");
  //   await domEvent.waitForElementToLoad("ul#categoryId li");

  // console.log("clicked the option 7");

  swalAlert.showCrosslistSuccessAlert();
}

function matchCondition(condition) {
  //return mercari condition value from our condition value
  switch (condition) {
    case "nwt":
      return "ConditionNew";

    case "nwot":
      return "ConditionLikenew";

    case "good":
      return "ConditionGood";

    case "preowned":
      return "ConditionFair";

    case "poor":
      return "ConditionPoor";

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
  fillOutMercariForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.brand,
    itemData.condition,
    itemData.color,
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
