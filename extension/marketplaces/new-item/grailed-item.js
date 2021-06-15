//LATER: create files by pages to make code cleaner

var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

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
  await domEvent.waitForElementToLoad("input[name='title']");

  let grailed_image_input = document.querySelector("input[type='file']");
  let grailed_title = document.querySelector("input[name='title']");
  let grailed_description = document.querySelector(
    "textarea[name='description']"
  );
  let grailed_color = document.querySelector("input[name='color']");
  let grailed_brand = document.querySelector("#designer-autocomplete"); //fillinput
  let grailed_condition = document.querySelector("select[name='condition']");
  let grailed_price = document.querySelector("input[name='price']");

  //images
  await uploadImages(imageUrls, grailed_image_input);

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

  swalAlert.closeSwal(); //close modal
  swalAlert.showCrosslistSuccessAlert(); //show success alert
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

async function uploadImages(images, targetElement) {
  //wait 100ms for inputs to render
  await helpers.delay(100);

  //truncate image array;
  let splicedImages = images.slice(0, 9); //grailed only allows 9 image uploads

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
