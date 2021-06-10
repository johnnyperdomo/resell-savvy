//LATER: create files by pages to make code cleaner

var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
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
  //NOTE: use pure dom on this one, since jquery is throwing some errors on this if tab is multiple tabs opened at the same time //LATER: use pure js, and remove jquery, this causes unexpected errors
  await domEvent.waitForElementToLoad("input[name='title']", 10000);

  //FIX: it seems to me like when grailed is called last when opening chrome tabs, idk, but maybe jquery isn't loading fast enough bcuz its not adding values. wait for page to render on every function, try with 100 or 500 least. or remove jquery all together, bcuz that works and is fast
  // const inputFiles = $('input[type="file"]');
  // console.log("input files, ", inputFiles);

  let grailed_title = document.querySelector("input[name='title']");
  let grailed_description = document.querySelector(
    "textarea[name='description']"
  );
  let grailed_color = document.querySelector("input[name='color']");
  let grailed_brand = document.querySelector("#designer-autocomplete"); //fillinput
  let grailed_condition = document.querySelector("select[name='condition']");
  let grailed_price = document.querySelector("input[name='price']");

  //title
  domEvent.dispatchEvent(grailed_title, "focus");
  domEvent.fillInputValue(grailed_title, title);
  domEvent.dispatchEvent(grailed_title, "blur");

  //brand
  if (brand != "") {
    domEvent.dispatchEvent(grailed_brand, "focus");
    domEvent.fillInputValue(grailed_brand, brand);

    await domEvent.waitForElementToLoad("ul.autocomplete li", 5000);

    let li = document.querySelector("ul.autocomplete li"); //grab first list item

    if (li) {
      //NOTE: 'mousedown' event, bcuz 'click' doesn't trigger on this element on grailed form.
      var clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("mousedown", true, true);
      li.dispatchEvent(clickEvent);
    }
  }

  //color
  if (color != "") {
    color = helpers.capitalize(color);

    domEvent.dispatchEvent(grailed_color, "focus");
    domEvent.fillInputValue(grailed_color, color);
    domEvent.dispatchEvent(grailed_color, "blur");
  }

  //condition
  if (condition != "") {
    let conditionValue = matchCondition(condition);

    domEvent.dispatchEvent(grailed_condition, "focus");
    grailed_condition.value = conditionValue;
    domEvent.dispatchEvent(grailed_condition, "blur");
  }

  //description
  domEvent.dispatchEvent(grailed_description, "focus");
  domEvent.fillTextAreaValue(grailed_description, description);
  domEvent.dispatchEvent(grailed_description, "blur");

  //LATER: currency/price validation
  //price
  domEvent.dispatchEvent(grailed_price, "focus");
  domEvent.fillInputValue(grailed_price, price);
  domEvent.dispatchEvent(grailed_price, "blur");

  swalAlert.showCrosslistSuccessAlert();
}

function matchCondition(condition) {
  //return grailed condition value from our condition value

  switch (condition) {
    case "nwt":
      return "is_new";

    case "nwot":
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

//LATER: do more error checking for fields, example like price/currency validation

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
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
};
