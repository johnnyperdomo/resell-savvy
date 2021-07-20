//NOTE:you have to select category first before having access to the other drop downs. Just default to 'kids clothing'

//LATER: create files by pages to make code cleaner
var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

async function fillOutKidizenForm(
  imageUrls,
  title,
  description,
  condition,
  brand,
  price
) {
  await domEvent.waitForElementToLoad("#item_title");
  console.log("images, ", imageUrls);

  //wait for page to render
  await helpers.delay(100);

  //LATER: //FIX: empty values showing undefined, this should just be empty
  let kidizen_image_input = document.querySelector("input[type='file']");
  let kidizen_title = document.querySelector("#item_title");
  let kidizen_description = document.querySelector("#item_description");
  let kidizen_price = document.querySelector("#item_list_price");

  //images
  await uploadImages(imageUrls, kidizen_image_input);

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
    "div:contains('Kid Clothing')",
    5000
  );
  kidDropDownItem.trigger("click");

  if (brand != "") {
    const brandEl = $("span:contains('Brand')").closest(
      ".DropdownTrigger--required"
    );

    brandEl.trigger("click");

    const dropDown = await domEvent.waitForElementToLoad(
      ".Dropdown",
      5000,
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
      `div:contains('${conditionVal}')`,
      5000
    );
    conditionDropDownItem.trigger("click");
  }

  //LATER: currency/price validation

  //price
  $(kidizen_price).trigger("focus");
  domEvent.fillInputValue(kidizen_price, price);
  $(kidizen_price).trigger("blur");

  swalAlert.closeSwal(); //close modal
  swalAlert.showCrosslistSuccessAlert(); //show success alert
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

async function uploadImages(images, targetElement) {
  //wait 100ms for inputs to render
  await helpers.delay(100);

  //truncate image array;
  let splicedImages = images.slice(0, 16); //kidizen only allows 16 < image uploads, but we will only work with 16 images

  //upload array of images simultaneously
  await imageRenderer.uploadImages(splicedImages, targetElement);

  return new Promise((resolve, reject) => {
    resolve();
  });
}

// //detect if document is ready
// document.onreadystatechange = function () {
//   //doc tree is loaded
//   if (document.readyState === "interactive") {
//     swalAlert.showPageLoadingAlert(); //swal alert ui waiting;
//   }

//   if (document.readyState === "complete") {
//     swalAlert.showProcessingAlert(); //swal alert ui waiting;

//     fillOutKidizenForm(
//       itemData.imageUrls,
//       itemData.title,
//       itemData.description,
//       itemData.condition,
//       itemData.brand,
//       itemData.price
//     );
//   }
// };

//listen for message from the crosslist listings
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.command == "set-item-data") {
    console.log("set listing objected detected: ", msg);

    //set item data, parse stringified json
    window.itemData = JSON.parse(msg.data.itemData);

    checkDocumentState();
  }
});

function checkDocumentState() {
  //doc is loaded
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting
  }

  document.addEventListener("readystatechange", () => {
    //doc tree is fully ready to be manipulated
    if (document.readyState === "complete") {
      swalAlert.showProcessingAlert();

     fillOutKidizenForm(
      window.itemData.imageUrls,
      window.itemData.title,
      window.itemData.description,
      window.itemData.condition,
      window.itemData.brand,
      window.itemData.price
    );
    }
  });
}
