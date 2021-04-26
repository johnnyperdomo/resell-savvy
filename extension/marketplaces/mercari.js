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
  "#sellName",
  function () {
    readyToInsertFields();
  },
  100,
  100000000000000
);

async function fillOutMercariForm(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  zipCode,
  price
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");
  let mercari_title = document.querySelector('input[data-testid="Title"]');
  let mercari_description = document.querySelector(
    'textarea[data-testid="Description"]'
  );

  let mercari_brand = document.querySelector('input[data-testid="Brand"]');
  let mercari_price = document.querySelector('input[data-testid="Price"]');

  fillInputValue(mercari_title, title);
  fillTextAreaValue(mercari_description, description);

  //LATER: brand isn't always going to work, because it's a drop down. Later in the help docs let the user know that you will try your best to aggregate data if data fields are acceptable, but can't guarantee perfect synchronization bcuz every platform is different.
  //TODO: try to match first item, if first item in list matches, then select brand, if not, don't select
  fillInputValue(mercari_brand, brand);

  if (condition != "") {
    let conditionValue = matchCondition(condition);

    console.log(conditionValue);
    $(`label[data-testid="${conditionValue}"]`).trigger("click");
  }

  if (color != "") {
    //TODO: click color
    //TODO: match color
  }

  //TODO: any number if available, round up, bcuz mercari doesn't accept decimals
  fillInputValue(mercari_price, price);

  //   $('button[data-testid="PhotoUploadButton"]').trigger("click");
  // $("#categoryId").trigger("click");
  // console.log("clicked the category");
  //   await waitForElementToLoad("ul#categoryId li");

  // console.log("clicked the option 7");
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
function readyToInsertFields() {
  fillOutMercariForm(
    [],
    "Nike xl premium shirt",
    "Nike shirt has only been used once but it is really good condition you cannot go wrong with this.",
    "Adidas",
    "nwot",
    "black",
    54365,
    54
  );
}
