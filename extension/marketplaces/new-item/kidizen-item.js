//NOTE:you have to select category first before having access to the other drop downs. Just default to 'kids clothing'

//LATER: create files by pages to make code cleaner
var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

async function fillOutKidizenForm(
  imageUrls,
  title,
  description,
  condition,
  brand,
  price
) {
  console.log("waiting on form filler");

  await domEvent.waitForElementToLoad("form");
  console.log("called form filler");

  let kidizen_title = document.querySelector("#item_title");
  let kidizen_description = document.querySelector("#item_description");
  let kidizen_price = document.querySelector("#item_list_price");

  fillInputValue(kidizen_title, title);
  fillTextAreaValue(kidizen_description, description);

  //set default category item
  $("span:contains('Category')")
    .closest(".DropdownTrigger--required")
    .trigger("click");
  const kidDropDownItem = await domEvent.waitForElementToLoad(
    "div:contains('Kid Clothing')"
  );
  kidDropDownItem.trigger("click");

  if (brand != "") {
    const brandEl = $("span:contains('Brand')").closest(
      ".DropdownTrigger--required"
    );

    brandEl.trigger("click");

    console.log(brandEl.parent().parent().find("div"));

    const dropDown = await domEvent.waitForElementToLoad(
      ".Dropdown",
      100000000,
      brandEl.parent().parent()
    );

    const searchBarInput = dropDown.find('input[placeholder="Search"]');
    fillInputValue(searchBarInput[0], brand);

    //wait half a second for dom to rerender
    await helpers.delay(500);

    const brandList = dropDown.find(" .Dropdown-item");

    if (brandList.length) {
      brandList.eq(0).trigger("click");
    }
  }

  if (condition != "") {
    const conditionVal = matchCondition(condition);

    $("span:contains('Condition')")
      .closest(".DropdownTrigger--required")
      .trigger("click");
    const conditionDropDownItem = await domEvent.waitForElementToLoad(
      `div:contains('${conditionVal}')`
    );
    conditionDropDownItem.trigger("click");
  }

  //LATER: currency/price validation
  fillInputValue(kidizen_price, price);

  swalAlert.showCrosslistSuccessAlert();
}

function matchCondition(condition) {
  //return kidizen condition value from our condition value
  switch (condition) {
    case "nwt":
      return "New with tag";

    case "nwot":
      return "New without tag";

    case "good":
      return "Very good used condition";

    case "preowned":
      return "Good used condition";

    case "poor":
      return "Play condition";

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
  fillOutKidizenForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
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
