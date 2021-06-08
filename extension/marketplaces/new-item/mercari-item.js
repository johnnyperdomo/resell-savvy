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
  await domEvent.waitForElementToLoad("#sellName");

  let mercari_title = document.querySelector('input[data-testid="Title"]');
  let mercari_description = document.querySelector(
    'textarea[data-testid="Description"]'
  );

  let mercari_brand = document.querySelector('input[data-testid="Brand"]');
  let mercari_price = document.querySelector('input[data-testid="Price"]');
  let mercari_color = document.querySelector('button[data-testid="Color"]');

  //title
  $(mercari_title).trigger("focus"); //simulate user inputs
  domEvent.fillInputValue(mercari_title, title);
  $(mercari_title).trigger("blur"); //TODO: i need to click on input to trigger user event, do this for every form

  //description
  $(mercari_description).trigger("focus"); //simulate user inputs
  domEvent.fillTextAreaValue(mercari_description, description);
  $(mercari_description).trigger("blur");

  //brand
  if (brand != "") {
    // $(mercari_brand).trigger("focus");
    domEvent.fillInputValue(mercari_brand, brand);

    //TODO: //FIX: what is going on here? this giving alot of problems, not working correctly, what
    let brandList = await domEvent.waitForElementToLoad(
      'div[data-testid="BrandDropdown"] > div > div'
    );

    //TODO: handle waitfor element errors, if not found. This brand should not work, but it should still continue running the other code. We should do like a wait for element, but time out after a few seconds. If not it just continues looping forever and blocks the next inputs

    if (brandList.length) {
      brandList.eq(0).trigger("click");
    }
  }

  //condition
  if (condition != "") {
    let conditionValue = matchCondition(condition);

    $(`label[data-testid="${conditionValue}"]`).trigger("click");
  }

  //color
  if (color != "") {
    $(mercari_color).trigger("click");

    color = helpers.capitalize(color);

    let searchColor = await domEvent.waitForElementToLoad(
      `li:contains('${color}')`
    );

    searchColor.trigger("click");
  }

  //LATER: any number if available, round up, bcuz mercari doesn't accept decimals //FIX
  //price
  $(mercari_price).trigger("focus");
  domEvent.fillInputValue(mercari_price, price);
  $(mercari_price).trigger("blur");

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

//LATER: do more error checking for fields, example like price/currency validation

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
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
};
