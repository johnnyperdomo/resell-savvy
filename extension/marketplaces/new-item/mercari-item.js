//LATER: create files by pages to make code cleaner

function waitForElementToLoad(selector, waitTimeMax, inTree) {
  //TODO: we need jQuery for this to work
  if (!inTree) inTree = $(document.body);
  let timeStampMax = null;
  if (waitTimeMax) {
    timeStampMax = new Date();
    timeStampMax.setSeconds(timeStampMax.getSeconds() + waitTimeMax);
  }
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      let node = inTree.find(selector);
      if (node.length > 0) {
        console.log("node is ready");
        clearInterval(interval);
        resolve(node);
      } else {
        console.log("node is not ready yet", selector);
      }
      if (timeStampMax && new Date() > timeStampMax) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });
}

// function waitForElementToDisplay(
//   selector,
//   callback,
//   checkFrequencyInMs,
//   timeoutInMs
// ) {
//   var startTimeInMs = Date.now();
//   (function loopSearch() {
//     if (document.querySelector(selector) != null) {
//       callback();
//       return;
//     } else {
//       setTimeout(function () {
//         if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
//         loopSearch();
//       }, checkFrequencyInMs);
//     }
//   })();
// }

// //TODO: call code from postMessage request
// waitForElementToDisplay(
//   "#sellName",
//   function () {
//     //itemData inherited from execute script
//     getItemDetails(itemData);
//   },
//   100,
//   100000000000000
// );

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

  await waitForElementToLoad("#sellName");
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

    // $(mercari_brand).trigger("input");

    //TODO: this giving alot of problems, not working correctly
    let brandList = await waitForElementToLoad(
      'div[data-testid="BrandDropdown"] > div > div'
    );

    // let brandList = await waitForElementToLoad(
    //   'div[data-testid="BrandDropdown"]',
    //   7500
    // );

    // let nestedDivs = brandList.find(" > div > div");

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

    color = capitalize(color);

    let searchColor = await waitForElementToLoad(`li:contains('${color}')`);

    searchColor.trigger("click");
  }

  //LATER: any number if available, round up, bcuz mercari doesn't accept decimals //FIX
  fillInputValue(mercari_price, price);

  //TODO: you need to simulate user inputs for it to validate the inputs before submiting //focus
  $(mercari_title).trigger("focus").trigger("blur");
  $(mercari_description).trigger("focus").trigger("blur");

  //   $('button[data-testid="PhotoUploadButton"]').trigger("click");
  // $("#categoryId").trigger("click");
  // console.log("clicked the category");
  //   await waitForElementToLoad("ul#categoryId li");

  // console.log("clicked the option 7");

  showCrosslistSuccessAlert();
}

function showCrosslistSuccessAlert() {
  Swal.fire({
    icon: "success",
    title: "Almost done!",
    html: `Item successfully crosslisted. Finish adding a few details unique to <b>Mercari</b> to finish your listing.`,
    timer: 7500,
    timerProgressBar: true,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    footer: "Don't forget to link this listing to your ResellSavvy inventory.",
  });
}

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

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
