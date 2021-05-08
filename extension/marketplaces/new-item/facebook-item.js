//LATER: create files by pages to make code cleaner
//LATER: make elements fail safely if not found, just skip instead of failing the entire function
//FIX: error with itemData not being recognized

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
  "label[aria-label='Title']",
  function () {
    //itemData inherited from execute script
    readyToInsertFields(itemData);
  },
  100,
  100000000000000
);

async function fillOutFacebookForm(
  imageUrls,
  title,
  description,
  condition,
  price
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");
  let facebook_title = document.querySelector(
    "label[aria-label='Title'] input"
  );
  let facebook_price = document.querySelector(
    "label[aria-label='Price'] input"
  );
  let facebook_description = document.querySelector(
    "label[aria-label='Description'] textarea"
  );

  fillInputValue(facebook_title, title);
  fillInputValue(facebook_price, price);

  if (condition != "") {
    let conditionValue = matchCondition(condition);

    //LATER: condition needs to click value

    //matches exact text
    $.expr[":"].textEquals = $.expr.createPseudo(function (arg) {
      return function (elem) {
        return $(elem)
          .text()
          .match("^" + arg + "$");
      };
    });

    $(`label[aria-label="Condition"]`).trigger("click");
    let searchCondition = await waitForElementToLoad(
      `span:textEquals('${conditionValue}')`
    );
    searchCondition.trigger("click");
  }

  fillTextAreaValue(facebook_description, description);
}

function matchCondition(condition) {
  //return poshmark condition value from our condition value
  switch (condition) {
    case "nwt":
      return "New";

    case "nwot":
      return "Used - Like New";

    case "good":
      return "Used - Good";

    case ("preowned", "poor"):
      return "Used - Fair";

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
function readyToInsertFields(itemData) {
  console.log("ready to insert fields is called from poshmark");

  fillOutFacebookForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.condition,
    itemData.price
  );
}
