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

  let grailed_title = $("input[name='title']");
  let grailed_description = $("textarea[name='description']");
  let grailed_color = $("input[name='color']");
  let grailed_brand = document.querySelector("#designer-autocomplete"); //fillinput
  let grailed_condition = $("select[name='condition']");
  let grailed_price = $("input[name='price']");

  //title
  grailed_title.trigger("focus").val(title).trigger("input").trigger("blur");

  //brand
  if (brand != "") {
    $(grailed_brand).trigger("focus");
    domEvent.fillInputValue(grailed_brand, brand);

    await domEvent.waitForElementToLoad("ul.autocomplete li");

    let li = document.querySelector("ul.autocomplete li"); //grab first list item

    if (li) {
      //'mousedown', bcuz 'click' doesn't trigger on this element on grailed form.
      var clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("mousedown", true, true);
      li.dispatchEvent(clickEvent);
    }
  }

  if (color != "") {
    color = helpers.capitalize(color);

    grailed_color.trigger("focus").val(color).trigger("input").trigger("blur");
  }

  //condition
  if (condition != "") {
    let conditionValue = matchCondition(condition);

    grailed_condition
      .trigger("focus")
      .val(conditionValue)
      .trigger("change")
      .trigger("blur");
  }

  //description
  grailed_description
    .trigger("focus")
    .val(description)
    .trigger("input")
    .trigger("blur");

  //LATER: currency/price validation
  //price
  grailed_price.trigger("focus").val(price).trigger("input").trigger("blur");

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
