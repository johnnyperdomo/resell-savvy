//LATER: create files by pages to make code cleaner
//LATER: watch for elements that are not yet loaded, and add them when they are actvated by their previous elements. i.e., brand is not available until the category is filled. watch and then fill as soon as it becomes available.

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   // Handle message.
//   // In this example, message === 'whatever value; String, object, whatever'

//   if (message == "hi") {
//     console.log(message, sender);
//     alert("runtime is , ", message);
//   }
// });

// function toDataUrl(url, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.onload = function () {
//     callback(xhr.response);
//   };
//   xhr.open("GET", url);
//   xhr.responseType = "blob";
//   xhr.send();
// }

// function convertImgToBase64URL(url, callback, outputFormat) {
//   var img = new Image();
//   img.crossOrigin = "Anonymous";
//   img.onload = function () {
//     var canvas = document.createElement("CANVAS"),
//       ctx = canvas.getContext("2d"),
//       dataURL;
//     canvas.height = img.height;
//     canvas.width = img.width;
//     ctx.drawImage(img, 0, 0);
//     dataURL = canvas.toDataURL(outputFormat);
//     callback(dataURL);
//     canvas = null;
//   };
//   img.src = url;
// }

// function getBase64Image(img) {
//   // Create an empty canvas element
//   var canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;

//   // Copy the image contents to the canvas
//   var ctx = canvas.getContext("2d");
//   ctx.drawImage(img, 0, 0);

//   // Get the data-URL formatted image
//   // Firefox supports PNG and JPEG. You could check img.src to
//   // guess the original format, but be aware the using "image/jpg"
//   // will re-encode the image.
//   var dataURL = canvas.toDataURL("image/png");

//   return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
// }

// function datablob(item) {
//   const dataTransfer = new DataTransfer();

//   dataTransfer.items.add(new File(["hello world"], "This_Works.txt"));

//   return dataTransfer.files;
// }

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

function waitForElementToDisplay(
  selector,
  callback,
  checkFrequencyInMs,
  timeoutInMs
) {
  var startTimeInMs = Date.now();
  (function loopSearch() {
    if (document.querySelector(selector) != null) {
      callback();
      return;
    } else {
      setTimeout(function () {
        if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}

//TODO: call code from postMessage request
waitForElementToDisplay(
  "#description",
  function () {
    //itemData inherited from execute script
    readyToInsertFields(itemData);
  },
  100,
  100000000000000
);

async function fillOutDepopForm(
  imageUrls,
  description,
  condition,
  color,
  price
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");
  let depop_description = document.querySelector(
    'textarea[data-testid="description__input"]'
  );
  let depop_price = document.querySelector('input[data-testid="price__input"]');
  let depop_condition = document.querySelector(
    'div[data-testid="listingSelect__listing__condition"] input'
  );
  let depop_color = document.querySelector("#listing__colour__select");

  let depop_image_input = document.querySelector("input[type=file]");

  fillTextAreaValue(depop_description, description);

  if (condition != "") {
    let conditionValue = matchCondition(condition);

    console.log(conditionValue);

    fillInputValue(depop_condition, conditionValue);
    let conditionList = await waitForElementToLoad(
      ".listingSelect__menu-list > div"
    );

    if (conditionList.length) {
      conditionList.eq(0).trigger("click");
    }
  }

  if (color != "") {
    //LATER: gray or grey should both match
    fillInputValue(depop_color, color);

    let searchColor = await waitForElementToLoad(
      `div[value*=${color}][class*=ColourSelectstyles__Colour]`
    );
    //closet traverses up the dom to find the closest element in the parent
    searchColor.closest(".listingSelect__option").trigger("click");
  }

  fillInputValue(depop_price, price);

  //LATER: price validation
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

//LATER: do more error checking for fields, example like price/currency validation, splices, and maximum length values
function readyToInsertFields(itemData) {
  fillOutDepopForm(
    itemData.imageUrls,
    itemData.description,
    itemData.condition,
    itemData.color,
    itemData.price
  );
}
