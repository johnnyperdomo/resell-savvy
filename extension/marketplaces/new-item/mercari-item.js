//LATER: create files by pages to make code cleaner
var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

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

  let mercari_image_input = document.querySelector('input[type="file"]');
  let mercari_title = document.querySelector('input[data-testid="Title"]');
  let mercari_description = document.querySelector(
    'textarea[data-testid="Description"]'
  );

  let mercari_brand = document.querySelector('input[data-testid="Brand"]');
  let mercari_price = document.querySelector('input[data-testid="Price"]');
  let mercari_color = document.querySelector('button[data-testid="Color"]');

  //images
  await uploadImages(imageUrls, mercari_image_input);

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
      'div[data-testid="BrandDropdown"] > div > div',
      5000
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
      `li:contains('${color}')`,
      5000
    );

    searchColor.trigger("click");
  }

  //LATER: any number if available, round up/down, bcuz mercari doesn't accept decimals //FIX
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

async function uploadImages(images, targetElement) {
  //wait 100ms for inputs to render
  await helpers.delay(100);

  //truncate image array;
  let sliced = images.slice(0, 12); //mercari only allows 12 image uploads

  //upload array of images simultaneously
  await imageRenderer.uploadImages(sliced, targetElement);

  return new Promise((resolve, reject) => {
    resolve();
  });
}

//LATER: do more error checking for fields, example like price/currency validation

//detect if document is ready
document.onreadystatechange = function () {
  //TODO: swal, after fixing mercari brand
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
