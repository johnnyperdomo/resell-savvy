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
//   "input[name='title']",
//   function () {
//     //itemData inherited from execute script
//     getItemDetails(itemData);
//   },
//   100,
//   100000000000000
// );

async function fillOutEtsyForm(imageUrls, title, description, price, sku) {
  console.log("waiting on form filler");

  await waitForElementToLoad("input[name='title']");
  console.log("called form filler");

  const inputFiles = $('input[type="file"]');

  console.log("input files, ", inputFiles);

  let etsy_title = document.querySelector("input[name='title']");
  let etsy_description = document.querySelector(
    "textarea[name='description-text-area']"
  );
  let etsy_price = document.querySelector("input[name='price-input']");
  let etsy_sku = document.querySelector("input[name='sku-input']");

  fillInputValue(etsy_title, title);
  fillTextAreaValue(etsy_description, description);

  //LATER: currency/price validation
  fillInputValue(etsy_price, price);
  fillInputValue(etsy_sku, sku);

  showCrosslistSuccessAlert();
}

function showCrosslistSuccessAlert() {
  //LATER: this inherits class from parent, try to fix but later on
  Swal.fire({
    icon: "success",
    title: "Almost done!",
    html: `Details successfully crosslisted. Finish adding a few details unique to <b>Etsy</b> to finish your listing.`,
    timer: 7500,
    timerProgressBar: true,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
  });
}

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function matchCondition(condition) {
  //return etsy condition value from our condition value
  switch (condition) {
    case ("nwt", "nwot"):
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
  //inherited value
  fillOutEtsyForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.price,
    itemData.sku
  );
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
    console.log("page complete");
  }
};
