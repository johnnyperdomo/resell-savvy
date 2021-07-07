//LATER: after items finish crosslisting, add a little popup(like how honey coupon has), at the top right corner. and mention something like - "we were able to fill the following properties based on listing details - "title", "description", "images", etc...." so everytime we fill a new item successfully, append it successfully to a property of sorts. (make it small and not annoying, and it doesn't block the ui, just like a small notication, they can leave it there or dismiss, but it shouldn't affect them )

//LATER: watch for elements that are not yet loaded, and add them when they are actvated by their previous elements. i.e., brand is not available until the category is filled. watch and then fill as soon as it becomes available.

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

async function fillOutDepopForm(
  imageUrls,
  description,
  condition,
  color,
  price
) {
  await domEvent.waitForElementToLoad("#description");

  //FIX: add brand Later, //LATER
  //wait for page to render
  await helpers.delay(100);

  let depop_image_input = document.querySelector("input[type='file']");
  let depop_description = document.querySelector(
    'textarea[data-testid="description__input"]'
  );
  let depop_price = document.querySelector('input[data-testid="price__input"]');
  let depop_condition = document.querySelector(
    'div[data-testid="listingSelect__listing__condition"] input'
  );
  let depop_color = document.querySelector("#listing__colour__select");

  //images
  await uploadImages(imageUrls, depop_image_input);

  //description
  $(depop_description).trigger("focus");
  domEvent.fillTextAreaValue(depop_description, description);
  $(depop_description).trigger("blur");

  //condition
  if (condition != "") {
    let conditionValue = matchCondition(condition);

    console.log(conditionValue);

    $(depop_condition).trigger("focus");
    domEvent.fillInputValue(depop_condition, conditionValue);
    let conditionList = await domEvent.waitForElementToLoad(
      ".listingSelect__menu-list > div",
      5000
    );

    if (conditionList.length) {
      conditionList.eq(0).trigger("click");
    }
  }

  if (color != "") {
    //LATER: gray or grey should both match
    $(depop_color).trigger("focus");
    domEvent.fillInputValue(depop_color, color);

    //get first color
    let searchColor = await domEvent.waitForElementToLoad(
      `[class*=ColourSelectstyles__Colour]`,
      5000
    );
    //closet traverses up the dom to find the closest element in the parent
    searchColor.closest(".listingSelect__option").trigger("click");
  }

  //LATER: price validation
  $(depop_price).trigger("focus");
  domEvent.fillInputValue(depop_price, price);
  $(depop_price).trigger("blur");

  swalAlert.closeSwal(); //close modal
  swalAlert.showCrosslistSuccessAlert(); //show success alert
}

function matchCondition(condition) {
  //return depop condition value from our condition value
  switch (condition) {
    case "nwt":
      return "Brand new";

    case "nwot":
      return "Like new";

    case "good":
      return "Excellent";

    case "preowned":
      return "Good";

    case "poor":
      return "Fair";

    default:
      return "";
  }
}

async function uploadImages(images, targetElement) {
  //wait 100ms for inputs to render
  await helpers.delay(100);

  //truncate image array;
  let splicedImages = images.slice(0, 4); //depop only allows 4 image uploads

  //upload array of images simultaneously
  await imageRenderer.uploadImages(splicedImages, targetElement);

  return new Promise((resolve, reject) => {
    resolve();
  });
}

//LATER: do more error checking for fields, example like price/currency validation, splices, and maximum length values

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting;
  }

  if (document.readyState === "complete") {
    swalAlert.showProcessingAlert(); //swal alert ui waiting;
    fillOutDepopForm(
      itemData.imageUrls,
      itemData.description,
      itemData.condition,
      itemData.color,
      itemData.price
    );
  }
};
