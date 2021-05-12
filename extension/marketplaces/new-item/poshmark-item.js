//LATER: make elements fail safely if not found, just skip instead of failing the entire function, check to see if element exists, simulate if element not found, send error using sentry

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
        console.log("node is not ready yet");
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
//   "input[data-vv-name='title']",
//   function () {
//     //itemData inherited from execute script
//     getItemDetails(itemData);
//   },
//   100,
//   100000000000000
// );

async function fillOutPoshmarkForm(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  listPrice,
  costPrice,
  sku
) {
  await waitForElementToLoad("input[data-vv-name='title']");
  console.log("wait for element to load");
  let poshmark_title = document.querySelector('input[data-vv-name="title"]');
  let poshmark_description = document.querySelector(
    'textarea[data-vv-name="description"]'
  );
  let poshmark_brand = document.querySelector(
    'div[data-et-name="listingEditorBrandSection"] input'
  );
  let poshmark_listingPrice = document.querySelector(
    'input[data-vv-name="listingPrice"]'
  );
  let poshmark_sku = document.querySelector('input[data-vv-name="sku"]');
  let poshmark_costPrice = document.querySelector(
    'input[data-vv-name="costPriceAmount"]'
  );

  fillInputValue(poshmark_title, title);
  fillTextAreaValue(poshmark_description, description);

  fillInputValue(poshmark_brand, brand);

  //TODO: round up, posh dont accept decimals
  fillInputValue(poshmark_listingPrice, listPrice);
  fillInputValue(poshmark_sku, sku);
  fillInputValue(poshmark_costPrice, costPrice);

  if (condition != "") {
    let conditionValue = formatCondition(condition);

    $(`button[data-et-name="${conditionValue}"]`).trigger("click");
  }

  if (color != "") {
    color = capitalize(color);

    // $(`div[data-et-name="color"]`).trigger("click");

    let searchColor = await waitForElementToLoad(`li:contains('${color}')`);

    searchColor.trigger("click");

    console.log(searchColor);
    // $('a:contains("This One")')
    //   .filter(function (index) {
    //     return $(this).text() === "This One";
    //   })
    //   .trigger("click");

    // console.log($(`a:contains("Red")`).parent());
  }
}

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function formatCondition(condition) {
  //return poshmark condition value from our condition value
  switch (condition) {
    case "nwt":
      return "nwt_yes";

    default:
      return "nwt_no";
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
  console.log(itemData);
  fillOutPoshmarkForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.brand,
    itemData.condition,
    itemData.color,
    itemData.price,
    itemData.cost,
    itemData.sku
  );
}

// //detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
    console.log("page complete");
  }
};
