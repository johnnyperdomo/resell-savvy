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

  //title
  $(kidizen_title).trigger("focus");
  domEvent.fillInputValue(kidizen_title, title);
  $(kidizen_title).trigger("blur");

  //description
  $(kidizen_description).trigger("focus");
  domEvent.fillTextAreaValue(kidizen_description, description);
  $(kidizen_description).trigger("blur");

  //category
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

    $(searchBarInput[0]).trigger("focus");
    domEvent.fillInputValue(searchBarInput[0], brand);

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

  //price
  $(kidizen_price).trigger("focus");
  domEvent.fillInputValue(kidizen_price, price);
  $(kidizen_price).trigger("blur");

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

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    fillOutKidizenForm(
      itemData.imageUrls,
      itemData.title,
      itemData.description,
      itemData.condition,
      itemData.brand,
      itemData.price
    );
  }
};
